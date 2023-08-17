import {
  KafkaClient,
  paymentRequestMessageSchema,
  userRequestMessageSchema,
} from "kafka-client";
import express from "express";

const kafka = new KafkaClient("backend2", ["localhost:9092"]);

const app = express();
app.listen(3001, () => {
  console.log(`Example app listening on port ${3000}`);
  console.log(kafka.getClientId());
  kafka.startConsumer(["payment-request", "user-request"], (message, topic) => {
    if (!message.value) return;
    if (topic === "payment-request") {
      const m = paymentRequestMessageSchema.parse(
        JSON.parse(message.value.toString())
      );
      console.log(m);
    }
    if (topic === "user-request") {
      const m = userRequestMessageSchema.parse(
        JSON.parse(message.value.toString())
      );
      console.log(m);
    }
  });
  kafka.sendMessage("payment-request", {
    type: "credit",
    from: "a",
    to: "b",
    amount: 1000,
  });
  kafka.sendMessage("user-request", {
    type: "create",
    age: 1,
    name: "bob",
    password: "123",
  });
});
