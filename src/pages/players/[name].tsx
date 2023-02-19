import {
  ActionIcon,
  Box,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import type { Player } from "../../helpers/api";
import { api } from "../../utils/api";

const Page = () => {
  const router = useRouter();
  const { data: player, isLoading } = api.player.byName.useQuery(
    { name: router.query.name as string },
    { enabled: !!router.query.name }
  );

  if (isLoading || !player)
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );

  return (
    <Container mt="lg">
      <Stack>
        <Card>
          <Group noWrap position="center">
            <Image
              height={64}
              width={64}
              src={`https://mc-heads.net/avatar/${
                player?.name ?? "a"
              }/100/nohelm.png`}
              alt={`Player head of ${player?.name ?? "a"}`}
            />
            <Title order={1}>{player?.name}</Title>
          </Group>
        </Card>
        <Card>
          <Title order={2} align="center">
            Statistiken
          </Title>
          <Grid mt="md">
            <Grid.Col span={6}>
              <SavewalkStats stats={player.statistics.safewalk} />
            </Grid.Col>
            <Grid.Col span={6}>
              <SmashStats stats={player.statistics.smash} />
            </Grid.Col>
          </Grid>
        </Card>
        <Card>
          <Title order={2} align="center">
            Freunde
          </Title>
          <Stack mt="md" spacing="sm">
            {player.friend.list.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </Stack>
          {player.friend.list.length === 0 && (
            <Text align="center" mt="md">
              Dieser Spieler hat noch keine Freunde.
            </Text>
          )}
        </Card>
      </Stack>
    </Container>
  );
};

const FriendCard = ({ friend }: { friend: Player["friend"]["list"][0] }) => {
  return (
    <CardBox>
      <Group position="apart" noWrap>
        <Group noWrap>
          <Image
            height={32}
            width={32}
            src={`https://mc-heads.net/avatar/${friend.name}/100/nohelm.png`}
            alt={`Player head of ${friend.name}`}
          />
          <Title order={3}>{friend.name}</Title>
        </Group>
        <ActionIcon
          component={Link}
          href={`/players/${friend.name.toLowerCase()}`}
        >
          <IconExternalLink size={20} />
        </ActionIcon>
      </Group>
    </CardBox>
  );
};

const SmashStats = ({
  stats,
}: {
  stats: Player["statistics"]["smash"] | undefined;
}) => {
  if (!stats) return null;

  return (
    <CardBox>
      <Stack spacing="xs">
        <Title order={3} align="center">
          Smash
        </Title>

        <StatsBlock
          statistics={{
            plays: stats.plays,
            wins: stats.wins,
            winChance: calculateWinChance(stats),
            kills: stats.kills,
            deaths: stats.deaths,
            kd: calculateKD(stats),
          }}
          labels={{
            plays: "Runden",
            wins: "Wins",
            winChance: "Gewinnchance",
            kills: "Kills",
            deaths: "Tode",
            kd: "K/D",
          }}
        />
      </Stack>
    </CardBox>
  );
};

const SavewalkStats = ({
  stats,
}: {
  stats: Player["statistics"]["safewalk"] | undefined;
}) => {
  if (!stats) return null;

  return (
    <CardBox>
      <Stack spacing="xs">
        <Title order={3} align="center">
          Safewalk
        </Title>

        <StatsBlock
          statistics={{
            plays: stats.plays,
            wins: stats.wins,
            winChance: calculateWinChance(stats),
            kills: stats.kills,
            deaths: stats.deaths,
            kd: calculateKD(stats),
          }}
          labels={{
            plays: "Runden",
            wins: "Wins",
            winChance: "Gewinnchance",
            kills: "Kills",
            deaths: "Tode",
            kd: "K/D",
          }}
        />
      </Stack>
    </CardBox>
  );
};

const calculateKD = (
  stats:
    | {
        kills: number;
        deaths: number;
      }
    | undefined
) => {
  if (!stats) return "0.00";
  const kd = stats.kills / (stats.deaths === 0 ? 1 : stats.deaths);
  return kd.toFixed(2);
};

const calculateWinChance = (stats: { wins: number; plays: number }) => {
  if (stats.plays === 0) return "0.00%";

  return (stats.wins / stats.plays).toFixed(2) + "%";
};

interface StatsValueProps<
  TStatistics extends Record<string, string | number> = Record<
    string,
    string | number
  >
> {
  statistics: TStatistics | undefined;
  labels: Record<keyof Exclude<TStatistics, undefined>, string>;
}

const StatsBlock = ({ statistics, labels }: StatsValueProps) => {
  if (!statistics) return null;

  return (
    <Grid>
      {Object.entries(statistics).map(([key, value]) => (
        <Grid.Col key={key} span={4}>
          <Stack spacing={4}>
            <Text>{labels[key]}</Text>
            <Title order={4} align="center">
              {value}
            </Title>
          </Stack>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default Page;

export const CardBox = (props: PropsWithChildren<{ pt?: "sm" }>) => (
  <Box
    sx={(theme) => ({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
      textAlign: "center",
      padding: theme.spacing.md,
      paddingTop: props.pt === "sm" ? theme.spacing.xs : theme.spacing.md,
      borderRadius: theme.radius.md,
    })}
  >
    {props.children}
  </Box>
);
