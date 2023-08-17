import { KafkaClient } from "kafka-client";
import express from "express";

const kafka = new KafkaClient("backend1");

const app = express();
app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
  console.log(kafka.getClientId());
});
