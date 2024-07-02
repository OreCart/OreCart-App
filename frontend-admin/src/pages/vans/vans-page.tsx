import { ActionIcon, Stack, Title } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getRoutes, getVans } from "../../api/routes.ts";
import { Van } from "../../api/types.ts";
import Card from "../../components/card/card.tsx";
import { ColoredSelect } from "./ColoredSelect.tsx";
import "./vans-page.scss";

const VanPage: React.FC = () => {
  const {
    data: vans,
    isLoading: vansLoading,
    error: vansError,
  } = useQuery({ queryKey: ["vans"], queryFn: getVans });

  const {
    data: routes,
    isLoading: routesLoading,
    error: routesError,
  } = useQuery({ queryKey: ["routes"], queryFn: getRoutes });

  if (vansLoading || routesLoading) return <div>Loading...</div>;
  if (vansError || routesError)
    return <div>An error occurred: {(vansError as Error).message}</div>;

  return (
    <main className="p-van-page">
      <Stack gap="md">
        <Title> Vans</Title>
        <div className="van-grid">
          {vans?.map((van: Van, index: number) => (
            <Card className="van-card">
              <Title order={2}>
                Van #{index + 1}{" "}
                <ActionIcon
                  variant="transparent"
                  color="black"
                  aria-label="Edit van settings"
                >
                  <IconPencil
                    // style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Title>
              <label>
                Assign to
                {routes && (
                  <ColoredSelect
                    // label="Assign route"
                    // className="van-route-select"
                    // placeholder="Pick value"
                    value={
                      routes.find((route) => route.id === van.routeId)?.name
                    }
                    data={routes.map((route) => ({
                      name: route.name,
                      color: route.color,
                    }))}
                    setValue={(val: string) => val} //TODO: Implement me lmao
                  />
                )}
              </label>
            </Card>
          ))}
        </div>
      </Stack>
    </main>
  );
};
export default VanPage;
