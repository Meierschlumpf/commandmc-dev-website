import {
  Card,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Title,
} from "@mantine/core";
import { useRouter } from "next/router";
import { getPositionColor } from ".";
import { api } from "../../utils/api";

const Page = () => {
  const router = useRouter();
  const { data: leaderBoard, isLoading } = api.leaderBoard.byName.useQuery(
    { name: router.query.name as string },
    { enabled: !!router.query.name }
  );

  if (isLoading || !leaderBoard)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );

  return (
    <Container mt="lg">
      <Title order={1}>Leaderboard - {leaderBoard.name}</Title>
      <Stack mb="md">
        {leaderBoard.items.map((item) => (
          <Card key={item.rank}>
            <Group position="apart">
              <Group>
                <Title order={2} color={getPositionColor(item.rank)}>
                  #{item.rank}
                </Title>
                <Title order={2}>{item.name}</Title>
              </Group>
              <Title order={2}>{item.points}</Title>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default Page;
