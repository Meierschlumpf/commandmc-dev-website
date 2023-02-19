import {
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Stack,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { api } from "../../utils/api";
import { CardBox } from "../players/[name]";

const Page = () => {
  const { data: leaderBoard, isLoading } = api.leaderBoard.overview.useQuery();

  if (!leaderBoard || isLoading)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );

  return (
    <Container>
      <h1>Leaderboard</h1>
      <Grid>
        <Grid.Col span={6}>
          <Card>
            <Title order={2} align="center">
              SafeWalk
            </Title>

            <Stack mt="sm" spacing="sm">
              {leaderBoard.safewalk.map((row) => (
                <CardBox key={row.rank}>
                  <Group position="apart">
                    <Group>
                      <Title order={4} color={getPositionColor(row.rank)}>
                        #{row.rank}
                      </Title>
                      <Title order={4}>{row.name}</Title>
                    </Group>
                    <Title order={4}>{row.points}</Title>
                  </Group>
                </CardBox>
              ))}
              <Button
                variant="default"
                fullWidth
                component={Link}
                href="/leaderboard/safewalk"
              >
                Mehr anzeigen
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card>
            <Title order={2} align="center">
              Smash
            </Title>

            <Stack mt="sm" spacing="sm">
              {leaderBoard.smash.map((row) => (
                <CardBox key={row.rank}>
                  <Group position="apart">
                    <Group>
                      <Title order={4} color={getPositionColor(row.rank)}>
                        #{row.rank}
                      </Title>
                      <Title order={4}>{row.name}</Title>
                    </Group>
                    <Title order={4}>{row.points}</Title>
                  </Group>
                </CardBox>
              ))}
              <Button
                variant="default"
                fullWidth
                component={Link}
                href="/leaderboard/smash"
              >
                Mehr anzeigen
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Page;

export const getPositionColor = (position: number) => {
  switch (position) {
    case 1:
      return "#D4AF37";
    case 2:
      return "#C0C0C0";
    case 3:
      return "#BF8970";
    default:
      return undefined;
  }
};
