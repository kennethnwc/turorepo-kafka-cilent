import { KafkaClient, paymentRequestMessageSchema } from "kafka-client";
import express from "express";

const kafka = new KafkaClient("backend1", ["localhost:9092"]);

const app = express();
app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
  console.log(kafka.getClientId());
  kafka.startConsumer(["payment-request"], (message, topic) => {
    if (!message.value) return;
    const m = paymentRequestMessageSchema.parse(
      JSON.parse(message.value.toString())
    );
    console.log(m);
  });
  kafka.sendMessage("user-request", {
    type: "update",
    address: "312",
    name: "user",
    email: "user@example.com",
  });
});
