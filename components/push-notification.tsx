import { Card, CardHeader, Heading, CardBody, Stack, StackDivider, Box, Text, Image } from "@chakra-ui/react";
import { PushNotification } from "@deep-foundation/firebase-push-notification";


export function PushNotification({ pushNotification }: { pushNotification: PushNotification }) {
  return <Card >
    <CardHeader>
      <Heading >{
        pushNotification.title
      }</Heading>
    </CardHeader>
    <CardBody>
      <Text>
        {
          pushNotification.body
        }
      </Text>
    </CardBody>
  </Card>
}