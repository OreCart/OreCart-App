import { Card, Text, Badge, Group } from "@mantine/core";

export function RidershipCard({
  name,
  numVans,
  numPassengers,
}: {
  name: string;
  numVans: number;
  numPassengers: number | undefined;
}) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ maxWidth: "15em" }}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg">{name}</Text>
        {numVans > 0 ? (
          <Badge color="myColor">
            {numVans} Van{numVans > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge color="red">
            No Vans
          </Badge>
        )}
      </Group>

      <Text size="xl" fw={700} ta="center" c="#001d47">
        {numPassengers ?? "No"} Passengers
      </Text>
    </Card>
  );
}
