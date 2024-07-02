import { Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getRoutes, getVanStatus, getVans } from "../../api/routes";
import { ColoredSelect } from "../vans/ColoredSelect";

export const VanStatusPage = () => {
  const {
    data: vanStatus,
    isLoading: vansStatusLoading,
    error: vansStatusError,
  } = useQuery({ queryKey: ["vansStatus"], queryFn: getVanStatus });
  const {
    data: vans,
    // isLoading: vansLoading,
    // error: vansError,
  } = useQuery({ queryKey: ["vans"], queryFn: getVans });
  const {
    data: routes,
    // isLoading: routesLoading,
    // error: routesError,
  } = useQuery({ queryKey: ["routes"], queryFn: getRoutes });
  if (vansStatusLoading) return <div>Loading...</div>;
  if (vansStatusError)
    return <div>An error occurred: {(vansStatusError as Error).message}</div>;

  //create a map that maps van guid to Van object
  const vanMap = new Map();
  vans?.forEach((van) => {
    vanMap.set(van.id, van);
  });
  //create a map that maps route id to Route object
  const routeMap = new Map();
  routes?.forEach((route) => {
    routeMap.set(route.id, route);
  });
  console.log(vanMap);
  console.log(routeMap);
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Van Name</Table.Th>
          <Table.Th>GUID</Table.Th>
          <Table.Th>Route</Table.Th>
          <Table.Th>Alive</Table.Th>
          <Table.Th>Session Start</Table.Th>
          <Table.Th>Last Update</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <tbody>
        {vanStatus &&
          vanStatus.map((item, index) => (
            <Table.Tr key={item.guid}>
              <Table.Td>Van #{index}</Table.Td>
              <Table.Td>{item.guid}</Table.Td>
              <Table.Td>
                {routes && (
                  <ColoredSelect
                    value={
                      routeMap?.get(vanMap?.get(Number(item.guid))?.routeId)
                        ?.name
                    }
                    data={routes.map((route) => ({
                      name: route.name,
                      color: route.color,
                    }))}
                    setValue={(val: string) => val} //TODO: Implement me lmao
                  />
                )}
              </Table.Td>
              <Table.Td>{item.alive ? "True" : "False"}</Table.Td>
              <Table.Td>
                {new Date(item.started * 1000).toLocaleString()}
              </Table.Td>
              <Table.Td>
                {new Date(item.updated * 1000).toLocaleString()}
              </Table.Td>
            </Table.Tr>
          ))}
      </tbody>
    </Table>
  );
};
