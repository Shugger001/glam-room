/**
 * Code Connect mapping for Glam Room SectionHeader.
 * Figma: https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-67
 */
import figma from "@figma/code-connect";
import { SectionHeader } from "./section";

figma.connect(
  SectionHeader,
  "https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-67",
  {
    props: {
      align: figma.enum("Align", {
        left: "left",
        center: "center",
      }),
      eyebrow: figma.string("Eyebrow"),
      title: figma.string("Title"),
      description: figma.string("Description"),
    },
    example: ({ align, eyebrow, title, description }) => (
      <SectionHeader
        align={align}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
    ),
  },
);
