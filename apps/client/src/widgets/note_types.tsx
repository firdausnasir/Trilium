/**
 * @module
 * Contains the definitions for all the note types supported by the application.
 */

import { NoteType } from "@triliumnext/commons";
import { type JSX, VNode } from "preact";

import { TypeWidgetProps } from "./type_widgets/type_widget";

/**
 * A `NoteType` altered by the note detail widget, taking into consideration whether the note is editable or not and adding special note types such as an empty one,
 * for protected session or attachment information.
 */
export type ExtendedNoteType = Exclude<NoteType, "launcher" | "text" | "code" | "llmChat"> | "empty" | "readOnlyCode" | "readOnlyText" | "editableText" | "editableCode" | "attachmentDetail" | "attachmentList" |  "protectedSession" | "sqlConsole" | "markdown" | "iconPack" | "llmChat" | "blobStub";

export type TypeWidget = (props: TypeWidgetProps) => VNode | JSX.Element | undefined;
type NoteTypeView = () => (Promise<{ default: TypeWidget } | TypeWidget> | TypeWidget);

interface NoteTypeMapping {
    view: NoteTypeView;
    printable?: boolean;
    /** The class name to assign to the note type wrapper */
    className: string;
    /** Whether the widget consumes the canvas or flows in its scrolling container. */
    layout: "flow" | "full-height";
}

export const TYPE_MAPPINGS: Record<ExtendedNoteType, NoteTypeMapping> = {
    empty: {
        view: () => import("./type_widgets/Empty"),
        className: "note-detail-empty",
        layout: "flow",
        printable: true
    },
    doc: {
        view: () => import("./type_widgets/Doc"),
        className: "note-detail-doc",
        layout: "flow",
        printable: true
    },
    search: {
        view: () => (props: TypeWidgetProps) => <></>,
        className: "note-detail-none",
        layout: "flow",
        printable: true
    },
    protectedSession: {
        view: () => import("./type_widgets/ProtectedSession"),
        className: "protected-session-password-component",
        layout: "full-height"
    },
    blobStub: {
        view: () => import("./type_widgets/BlobStub"),
        className: "note-detail-blob-stub",
        layout: "flow"
    },
    book: {
        view: () => import("./type_widgets/Book"),
        className: "note-detail-book",
        layout: "flow",
        printable: true,
    },
    contentWidget: {
        view: () => import("./type_widgets/ContentWidget"),
        className: "note-detail-content-widget",
        layout: "flow",
        printable: true
    },
    webView: {
        view: () => import("./type_widgets/WebView"),
        className: "note-detail-web-view",
        printable: true,
        layout: "full-height"
    },
    file: {
        view: () => import("./type_widgets/File"),
        className: "note-detail-file",
        printable: true,
        layout: "full-height"
    },
    image: {
        view: () => import("./type_widgets/Image"),
        className: "note-detail-image",
        layout: "full-height",
        printable: true
    },
    readOnlyCode: {
        view: async () => (await import("./type_widgets/code/Code")).ReadOnlyCode,
        className: "note-detail-readonly-code",
        layout: "flow",
        printable: true
    },
    editableCode: {
        view: async () => (await import("./type_widgets/code/Code")).EditableCode,
        className: "note-detail-code",
        layout: "full-height",
        printable: true
    },
    mermaid: {
        view: () => import("./type_widgets/mermaid/Mermaid"),
        className: "note-detail-mermaid",
        printable: true,
        layout: "full-height"
    },
    mindMap: {
        view: () => import("./type_widgets/mind_map/MindMap"),
        className: "note-detail-mind-map",
        printable: true,
        layout: "full-height"
    },
    attachmentList: {
        view: async () => (await import("./type_widgets/Attachment")).AttachmentList,
        className: "attachment-list",
        layout: "flow",
        printable: true
    },
    attachmentDetail: {
        view: async () => (await import("./type_widgets/Attachment")).AttachmentDetail,
        className: "attachment-detail",
        layout: "flow",
        printable: true
    },
    readOnlyText: {
        view: () => import("./type_widgets/text/ReadOnlyText"),
        className: "note-detail-readonly-text",
        layout: "flow"
    },
    editableText: {
        view: () => import("./type_widgets/text/EditableText"),
        className: "note-detail-editable-text",
        layout: "flow",
        printable: true
    },
    render: {
        view: () => import("./type_widgets/Render"),
        className: "note-detail-render",
        layout: "flow",
        printable: true
    },
    canvas: {
        view: () => import("./type_widgets/canvas/Canvas"),
        className: "note-detail-canvas",
        printable: true,
        layout: "full-height"
    },
    relationMap: {
        view: () => import("./type_widgets/relation_map/RelationMap"),
        className: "note-detail-relation-map",
        printable: true,
        layout: "full-height"
    },
    noteMap: {
        view: () => import("./type_widgets/NoteMap"),
        className: "note-detail-note-map",
        printable: true,
        layout: "full-height"
    },
    sqlConsole: {
        view: () => import("./type_widgets/SqlConsole"),
        className: "sql-console-widget-container",
        layout: "full-height"
    },
    markdown: {
        view: () => import("./type_widgets/markdown/Markdown"),
        className: "note-detail-markdown",
        printable: true,
        layout: "full-height"
    },
    iconPack: {
        view: () => import("./type_widgets/icon_pack/IconPack"),
        className: "note-detail-icon-pack",
        printable: true,
        layout: "full-height"
    },
    spreadsheet: {
        view: () => import("./type_widgets/spreadsheet/Spreadsheet"),
        className: "note-detail-spreadsheet",
        printable: true,
        layout: "full-height"
    },
    llmChat: {
        view: () => import("./type_widgets/llm_chat/LlmChat"),
        className: "note-detail-llm-chat",
        printable: true,
        layout: "full-height"
    }
};

/** The note types whose modules are fetched ahead of time by {@link preloadCommonNoteTypes}. */
const PRELOADED_NOTE_TYPES: ExtendedNoteType[] = [ "editableText" ];

let preloadRequested = false;

/**
 * Fetches ahead of time the modules of the note types most likely to be displayed, so that the first
 * note to be displayed does not have to wait for them.
 *
 * The text note's are by far the largest: its editor — CKEditor together with Trilium's plugins for
 * it — is around 1.4 MB of script (≈ 375 kB compressed), fetched and parsed only once a text note is
 * actually shown. That is long enough to be felt as a delay when opening the first text note after a
 * reload, or when clicking a calendar event to have it open in the popup editor. Fetching it while
 * the application sits idle instead moves that cost away from the moment the user is waiting on it.
 *
 * Deliberately kept to the text note: note types are lazily loaded so that a session never pays for
 * what it never displays, and warming more of them would erode that. Creating the editor itself is
 * comparatively cheap (tens of milliseconds), so only the modules are fetched here — no editor is
 * built in advance.
 *
 * Calling this more than once does nothing: the first call is the one that counts.
 */
export function preloadCommonNoteTypes() {
    if (preloadRequested) return;
    preloadRequested = true;

    whenIdle(() => {
        for (const noteType of PRELOADED_NOTE_TYPES) {
            // A failure here is of no consequence: the module is fetched again, and reported on
            // then, when the note type is actually displayed.
            void Promise.resolve(TYPE_MAPPINGS[noteType].view()).catch(() => {});
        }
    });
}

/**
 * Runs the callback once the browser is idle, or after a short delay where the browser has no notion
 * of idleness (older Safari / WebKit). The timeout keeps the work from being put off indefinitely on
 * a page that never goes idle.
 */
function whenIdle(callback: () => void) {
    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(callback, { timeout: 5_000 });
    } else {
        setTimeout(callback, 1_000);
    }
}
