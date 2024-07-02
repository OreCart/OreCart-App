import { Paper } from "@mantine/core";
import React from "react";
import "./card.scss";

interface CardProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <Paper
      p="lg"
      className={`c-card ${className}`}
      radius="lg"
      onClick={onClick}
    >
      <div className="card-content">{children}</div>
    </Paper>
  );
};

export default Card;
