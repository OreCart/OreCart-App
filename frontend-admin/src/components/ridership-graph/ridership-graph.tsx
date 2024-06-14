import { Button, Group, MantineProvider } from "@mantine/core";
import ApexCharts from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

export class RidershipGraph extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      series: props.data,
      options: {
        chart: {
          id: "area-datetime",
          type: "area",
          height: 350,
          zoom: {
            autoScaleYaxis: true,
          },
        },
        annotations: {
          yaxis: [],
          xaxis: [],
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
          style: "hollow",
        },
        xaxis: {
          type: "datetime",
          min: new Date("01 Apr 2024").getTime(),
          tickAmount: 6,
        },
        yaxis: {
          min: 0,
        },
        tooltip: {
          x: {
            format: "dd MMM yyyy",
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      },

      selection: "one_year",
    };
  }

  updateData(timeline: any) {
    this.setState({
      selection: timeline,
    });

    switch (timeline) {
      case "today":
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          new Date().setHours(0, 0, 0, 0),
          new Date().getTime()
        );
        break;
      case "one_month":
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          new Date(new Date().setDate(1)).setHours(0, 0, 0, 0),
          new Date().getTime()
        );
        break;
      case "six_months":
        // Any Date set returns it as a number not as a Date
        // move the month 5 months back
        let sixMonths: number = new Date().setMonth(new Date().getMonth() - 5);
        // set it to midnight
        sixMonths = new Date(sixMonths).setHours(0, 0, 0, 0);
        // set it to the first of the month
        sixMonths = new Date(sixMonths).setDate(1);
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          sixMonths,
          new Date().getTime()
        );
        break;
      case "one_year":
        // Any Date set returns it as a number not as a Date
        // move the year 1 back
        let oneYear: number = new Date().setFullYear(
          new Date().getFullYear() - 1
        );
        // set it to midnight
        oneYear = new Date(oneYear).setHours(0, 0, 0, 0);
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          oneYear,
          new Date().getTime()
        );
        break;
      case "ytd":
        let thisYear = new Date().setDate(1);
        thisYear = new Date(thisYear).setMonth(1);
        thisYear = new Date(thisYear).setHours(0, 0, 0, 0);
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          thisYear,
          new Date().getTime()
        );
        break;
      case "all":
        ApexCharts.exec(
          "area-datetime",
          "zoomX",
          this.state.series[0].data[0][0],
          this.state.series[0].data[this.state.series[0].data.length - 1][0]
        );
        break;
      default:
    }
  }

  render() {
    return (
      <MantineProvider theme={this.props.theme}>
        <div id="chart">
          <div className="toolbar">
            <Group gap="xs">
              <Button
                id="today"
                onClick={() => this.updateData("today")}
                variant={this.state.selection === "today" ? "light" : "default"}
              >
                Today
              </Button>
              <Button
                id="one_month"
                onClick={() => this.updateData("one_month")}
                variant={
                  this.state.selection === "one_month" ? "light" : "default"
                }
              >
                1M
              </Button>

              <Button
                id="six_months"
                onClick={() => this.updateData("six_months")}
                variant={
                  this.state.selection === "six_months" ? "light" : "default"
                }
              >
                6M
              </Button>

              <Button
                id="one_year"
                onClick={() => this.updateData("one_year")}
                variant={
                  this.state.selection === "one_year" ? "light" : "default"
                }
              >
                1Y
              </Button>

              <Button
                id="ytd"
                onClick={() => this.updateData("ytd")}
                variant={this.state.selection === "ytd" ? "light" : "default"}
              >
                YTD
              </Button>

              <Button
                id="all"
                onClick={() => this.updateData("all")}
                variant={this.state.selection === "all" ? "light" : "default"}
              >
                ALL
              </Button>
            </Group>
          </div>

          <div id="chart-timeline">
            <ReactApexChart
              options={this.state.options}
              series={this.state.series}
              type="area"
              height={350}
            />
          </div>
        </div>
        <div id="html-dist"></div>
      </MantineProvider>
    );
  }
}
