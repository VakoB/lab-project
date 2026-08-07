# RabbitMQ

## Overview

Excel file processing is handled asynchronously. The API accepts the upload,
publishes a job to RabbitMQ, and responds immediately. A separate worker
service picks up the job, processes it in the background, and saves results
to the database. The user polls for status.

lab-project(api)
POST /files/:id/process -> creates FileProcessingJob (PENDING) in db -> publishes to RabbitMQ -> returns jobId

RabbitMQ -> file.direct (exchange) -> routing key: file.process -> file-processing (queue)
(if fails: file-processing-failed)

worker (separate nestjs microservice) -> receives message -> downloads excel file from MinIO -> validates columns -> calculates totals -> saves ProcessingResult to db -> marks job COMPLETED -> ACKs message

## Failure scenarios

### Excel validation failure

Worker receives message -> downloads file -> parser finds missing columns or
invalid data -> logs error -> job marked FAILED -> NACK sent -> RabbitMQ requeues.

### MinIO unreachable

Worker receives message -> download fails -> throws -> job marked FAILED -> NACK sent -> Rabbitmq requeues -> retried.

### Worker crashes mid-processing

Worker crashes before ACK -> RabbitMQ never receives ACK -> message
stays in queue -> when worker restarts, it reconnects -> RabbitMQ
redelivers the message -> worker processes it again -> idempotency
check -> if job is COMPLETED skip, otherwise reprocess

### Max retries exceeded

After 3 failed attempts (tracked via `retryCount` in db) -> worker sends
NACK with `requeue: false` -> Rabbitmq moves message to
`file-processing-failed` DLQ -> job remains FAILED in db with `errorMessage`.

## Duplicate Message Handling (Idempotency)

Rabbitmq can redeliver the same message more than once when:

- Worker processed successfully but crashed before sending ACK
- Network hiccup between worker and RabbitMQ

solution: Before processing, worker checks the job's current status in db:
status = COMPLETED -> skip, return immediately, send ACK
status = PENDING/FAILED -> process normally

This guarantees the same file is never processed twice even if the message
is delivered multiple times.
