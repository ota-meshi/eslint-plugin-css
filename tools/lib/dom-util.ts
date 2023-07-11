/**
 * Checks if the given element is a HTMLTableElement.
 */
export function isHTMLTableElement(
  table: Element | null,
): table is HTMLTableElement {
  return table != null && table.tagName === "TABLE";
}
