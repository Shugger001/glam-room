/**
 * Code Connect mapping for Glam Room Button.
 * Figma: https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-52
 *
 * Publish requires a Figma Organization/Enterprise Dev seat.
 * Until then this file documents the intended mapping for `npx figma connect`.
 */
import figma from "@figma/code-connect";
import { Button } from "./button";

figma.connect(
  Button,
  "https://www.figma.com/design/SUWzV96td5gqekH0Ao0f1A?node-id=4-52",
  {
    props: {
      variant: figma.enum("Variant", {
        primary: "primary",
        accent: "accent",
        outline: "outline",
        secondary: "secondary",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
      children: figma.string("Label"),
    },
    example: ({ variant, size, children }) => (
      <Button variant={variant} size={size}>
        {children}
      </Button>
    ),
  },
);
