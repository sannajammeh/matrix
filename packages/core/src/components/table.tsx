import { classed } from "./classed.config";

const TableRoot = classed.div("w-full overflow-auto");

const Table = classed.table("w-full caption-bottom text-sm");

Table.displayName = "Table";

const TableHeader = classed.thead("[&_tr]:border-b");
TableHeader.displayName = "TableHeader";

const TableBody = classed.tbody("[&_tr:last-child]:border-0");
TableBody.displayName = "TableBody";

const TableFooter = classed.tfoot("bg-primary font-medium text-radix-blue11");
TableFooter.displayName = "TableFooter";

const TableRow = classed.tr(
  "border-b transition-colors hover:bg-radix-slateA3 data-[state=selected]:bg-radix-slateA3"
);
TableRow.displayName = "TableRow";

const TableHead = classed.th(
  "h-12 px-4 text-left align-middle font-medium text-radix-slate11 [&:has([role=checkbox])]:pr-0"
);
TableHead.displayName = "TableHead";

const TableCell = classed.td("p-4 align-middle [&:has([role=checkbox])]:pr-0");
TableCell.displayName = "TableCell";

const TableCaption = classed.caption("mt-4 text-sm text-radix-slate11");
TableCaption.displayName = "TableCaption";

export {
  TableRoot,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
