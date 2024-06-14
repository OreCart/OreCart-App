import React from "react";
import "./ridership-page.scss";
import { RidershipCard } from "../../components/ridership-card/ridership-card";
import {
  Flex,
  VariantColorsResolver,
  defaultVariantColorsResolver,
} from "@mantine/core";
import { RidershipGraph } from "../../components/ridership-graph/ridership-graph";
// import useWebSocket, { ReadyState } from "react-use-websocket";

const RidershipPage = () => {
  // const baseSocketUrl = import.meta.env.VITE_WEBSOCKET_URL + "/ridership";
  // const [socketUrl, setSocketUrl] = React.useState(baseSocketUrl + "/subscribe");
  // const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
  //   socketUrl,
  //   {
  //     share: true,
  //     shouldReconnect: () => true,
  //   }
  // );

  // // Run when the connection state (readyState) changes
  // React.useEffect(() => {
  //   console.log("Connection state changed");
  //   if (readyState === ReadyState.OPEN) {
  //     sendJsonMessage({
  //       event: "subscribe"
  //     });
  //   }
  // }, [readyState]);
  // // Run when a new WebSocket message is received (lastJsonMessage)
  // React.useEffect(() => {
  //   console.log(`Got a new message: ${lastJsonMessage}`);
  // }, [lastJsonMessage]);

  const [ridership, setRidership] = React.useState({
    routes: [
      {
        id: 0,
        name: "Golden Route",
        numPassengers: 6,
        numVans: 1,
      },
      {
        id: 1,
        name: "Mines Park",
        numVans: 0,
      },
      {
        id: 2,
        name: "Loop de Loop",
        numPassengers: 20,
        numVans: 5,
      },
    ],
    historic: [
      {
        name: "Mines Park",
        data: [
          [1713587537000, 38],
          [1713591137000, 32],
          [1713594737000, 38],
          [1713598337000, 5],
          [1713601937000, 9],
          [1713605537000, 25],
          [1713609137000, 18],
          [1713612737000, 2],
          [1713616337000, 34],
          [1713619937000, 36],
          [1713623537000, 16],
          [1713627137000, 33],
          [1713630737000, 38],
          [1713634337000, 14],
          [1713637520000, 1],
          [1713637937000, 13],
          [1713640884000, 32],
          [1713641140000, 28],
        ],
      },
      {
        name: "Loop de Loop",
        data: [
          [1713587537000, 16],
          [1713591137000, 33],
          [1713594737000, 15],
          [1713598337000, 11],
          [1713601937000, 37],
          [1713605537000, 0],
          [1713609137000, 4],
          [1713612733000, 27],
          [1713616352000, 2],
          [1713619937000, 31],
          [1713623537000, 28],
          [1713627137000, 30],
          [1713630737000, 39],
          [1713634337000, 38],
          [1713637520000, 40],
          [1713637937000, 39],
          [1713640884000, 24],
          [1713641140000, 7],
        ],
      },
    ],
  });

  const variantColorResolver: VariantColorsResolver = (input: any) => {
    const defaultResolvedColors = defaultVariantColorsResolver(input);

    if (input.variant === "light") {
      return {
        ...defaultResolvedColors,
        color: "var(--mantine-color-black)",
      };
    }

    return defaultResolvedColors;
  };

  return (
    <main className="p-ridership-page">
      <h1>Ridership</h1>
      <Flex wrap="wrap" direction="row" gap="md">
        {ridership.routes.map((route) => (
          <RidershipCard
            key={route.id}
            name={route.name}
            numVans={route.numVans}
            numPassengers={route.numPassengers}
          />
        ))}
      </Flex>
      <h1>Trends</h1>
      <RidershipGraph
        theme={{ variantColorResolver }}
        data={ridership.historic}
      />
    </main>
  );
};

export default RidershipPage;
