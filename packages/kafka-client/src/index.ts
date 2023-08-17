import { Consumer, Kafka, KafkaMessage, Partitioners, Producer } from "kafkajs";
import { z } from "zod";

interface IKafkaClient {
  checkStatus(): Promise<{ topics: string[] }>;
  startConsumer<T extends Array<(typeof TOPICS)[number]>>(
    topics: T,
    handleKafkaMessage: (message: KafkaMessage, topic: T[number]) => void
  ): Promise<void>;
  stopConsumer(): Promise<void>;
  sendMessage<T extends Topic>(topic: T, message: Message<T>): Promise<void>;
  getClientId: () => ClientId | undefined;
}

const groupID = {
  backend1: "backend1-group",
  backend2: "backend2-group",
} as const;

type ClientId = keyof typeof groupID;
type Topic = (typeof TOPICS)[number];

export class KafkaClient implements IKafkaClient {
  private kafkaClient: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private clientId: ClientId | undefined;
  constructor(
    clientId: ClientId,
    brokers: string[],
    connectionTimeout: number = 5000
  ) {
    this.kafkaClient = new Kafka({
      clientId: clientId,
      brokers,
      connectionTimeout: connectionTimeout,
    });
    this.producer = this.kafkaClient.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      idempotent: true,
    });
    this.consumer = this.kafkaClient.consumer({
      groupId: groupID[clientId],
    });
    this.clientId = clientId;
  }

  async startConsumer<T extends Array<(typeof TOPICS)[number]>>(
    topics: T,
    handleKafkaMessage: (message: KafkaMessage, topic: T[number]) => void
  ): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: topics });
    console.log(`consumer subscribed to ${topics}`);
    await this.consumer.run({
      eachMessage: async ({ message, topic }) => {
        handleKafkaMessage(message, topic as T[number]);
      },
    });
  }

  async stopConsumer(): Promise<void> {
    await this.consumer.disconnect();
  }

  async checkStatus() {
    const admin = this.kafkaClient.admin();
    await admin.connect();
    // Check the list of topics
    const topics = await admin.listTopics();
    return { topics };
  }

  async sendMessage<T extends Topic>(
    topic: T,
    message: T extends "user-request"
      ? UserRequestMessage
      : T extends "payment-request"
      ? PaymentRequestMessage
      : never
  ): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic: topic,
      acks: -1,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }

  getClientId() {
    return this.clientId;
  }
}

const TOPICS = ["user-request", "payment-request"] as const;
const userCreateRequestMessageSchema = z.object({
  name: z.string(),
  password: z.string(),
  age: z.number(),
});
const userUpdateRequestMessageSchema = z.object({
  name: z.string(),
  email: z.string(),
  address: z.string(),
});
export const userRequestMessageSchema = z.discriminatedUnion("type", [
  userCreateRequestMessageSchema.extend({ type: z.literal("create") }),
  userUpdateRequestMessageSchema.extend({ type: z.literal("update") }),
]);

// Message type
type UserRequestMessage = z.infer<typeof userRequestMessageSchema>;

export const paymentRequestMessageSchema = z.object({
  type: z.enum(["credit", "debit"]),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
});
type PaymentRequestMessage = z.infer<typeof paymentRequestMessageSchema>;

type Message<T extends Topic> = T extends "user-request"
  ? UserRequestMessage
  : T extends "payment-request"
  ? PaymentRequestMessage
  : never;
