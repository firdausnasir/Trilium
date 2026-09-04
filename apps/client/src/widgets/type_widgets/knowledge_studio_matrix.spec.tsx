import { describe, expect, it } from "vitest";

import { type ExtendedNoteType, TYPE_MAPPINGS } from "../note_types";

type ExpectedContract = Partial<
    Record<ExtendedNoteType, {
        className: string;
        layout: "flow" | "full-height";
    }>
>;

function expectContracts(expected: ExpectedContract) {
    for (const [ type, contract ] of Object.entries(expected)) {
        const mapping = TYPE_MAPPINGS[type as ExtendedNoteType];
        expect(mapping, `${type} mapping`).toBeDefined();
        expect({ className: mapping.className, layout: mapping.layout }).toEqual(contract);
    }
}

describe("Knowledge Studio note-type matrix", () => {
    it("NT-01 keeps editable and read-only text in document flow", () => {
        expectContracts({
            editableText: { className: "note-detail-editable-text", layout: "flow" },
            readOnlyText: { className: "note-detail-readonly-text", layout: "flow" }
        });
    });

    it("NT-02 gives editors and split consoles full height without stretching read-only code", () => {
        expectContracts({
            editableCode: { className: "note-detail-code", layout: "full-height" },
            readOnlyCode: { className: "note-detail-readonly-code", layout: "flow" },
            markdown: { className: "note-detail-markdown", layout: "full-height" },
            sqlConsole: { className: "sql-console-widget-container", layout: "full-height" }
        });
    });

    it("NT-03 leaves collection height to the selected collection renderer", () => {
        // List/grid stay in flow; table, calendar, board, geo map, and dashboard own full-height slots.
        expectContracts({ book: { className: "note-detail-book", layout: "flow" } });
    });

    it("NT-04 gives web and file previews the full canvas", () => {
        expectContracts({
            webView: { className: "note-detail-web-view", layout: "full-height" },
            file: { className: "note-detail-file", layout: "full-height" }
        });
    });

    it("NT-05 gives the image viewer and its zoom overlays the full canvas", () => {
        expectContracts({ image: { className: "note-detail-image", layout: "full-height" } });
    });

    it("NT-06 isolates diagram and drawing canvases in full-height wrappers", () => {
        expectContracts({
            mermaid: { className: "note-detail-mermaid", layout: "full-height" },
            mindMap: { className: "note-detail-mind-map", layout: "full-height" },
            canvas: { className: "note-detail-canvas", layout: "full-height" }
        });
    });

    it("NT-07 gives relation and note maps full-height graph canvases", () => {
        expectContracts({
            relationMap: { className: "note-detail-relation-map", layout: "full-height" },
            noteMap: { className: "note-detail-note-map", layout: "full-height" }
        });
    });

    it("NT-08 gives the spreadsheet toolbar, canvas, and popovers full height", () => {
        expectContracts({
            spreadsheet: { className: "note-detail-spreadsheet", layout: "full-height" }
        });
    });

    it("NT-09 gives icon-pack search and results the full canvas", () => {
        expectContracts({ iconPack: { className: "note-detail-icon-pack", layout: "full-height" } });
    });

    it("NT-10 gives chat messages and composer the full canvas", () => {
        expectContracts({ llmChat: { className: "note-detail-llm-chat", layout: "full-height" } });
    });

    it("NT-11 keeps attachment and missing-blob states in their owning scroll contract", () => {
        expectContracts({
            attachmentList: { className: "attachment-list", layout: "flow" },
            attachmentDetail: { className: "attachment-detail", layout: "flow" },
            blobStub: { className: "note-detail-blob-stub", layout: "flow" }
        });
    });

    it("NT-12 centers the protected-session form in the full canvas", () => {
        expectContracts({
            protectedSession: { className: "protected-session-password-component", layout: "full-height" }
        });
    });

    it("NT-13 keeps render and content widgets in isolated flow wrappers", () => {
        expectContracts({
            render: { className: "note-detail-render", layout: "flow" },
            contentWidget: { className: "note-detail-content-widget", layout: "flow" }
        });
    });

    it("NT-14 keeps empty, document, and search states in document flow", () => {
        expectContracts({
            empty: { className: "note-detail-empty", layout: "flow" },
            doc: { className: "note-detail-doc", layout: "flow" },
            search: { className: "note-detail-none", layout: "flow" }
        });
    });

    it("assigns one scoped wrapper class and an explicit layout to every extended note type", () => {
        const mappings = Object.values(TYPE_MAPPINGS);
        const classNames = mappings.map(({ className }) => className);

        expect(new Set(classNames).size).toBe(classNames.length);
        expect(mappings.every(({ layout }) => layout === "flow" || layout === "full-height"))
            .toBe(true);
    });
});
