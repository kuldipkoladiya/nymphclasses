"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend
);

export default function ChartComponent({ type, data }) {
    if (type === "bar") {
        return <Bar data={data} height={140} />;
    }

    if (type === "doughnut") {
        return <Doughnut data={data} />;
    }

    return null;
}
