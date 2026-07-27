/**
 * Code Connect mapping for Glam Room ServiceCard.
 * Figma: https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-69
 */
import figma from "@figma/code-connect";
import { ServiceCard } from "./service-card";

figma.connect(
  ServiceCard,
  "https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-69",
  {
    example: () => (
      <ServiceCard
        service={{
          id: "example",
          slug: "soft-glam",
          name: "Soft Glam Makeup",
          description: "Natural finish with luminous skin.",
          category: "hair-installation",
          durationMinutes: 60,
          price: 350,
          image: "/images/glam-adenta-portrait.png",
        }}
        disableReveal
      />
    ),
  },
);
