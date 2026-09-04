import { describe, expect, it } from "vitest";

import { getDesktopShellPlacement } from "./desktop_layout";

describe("desktop layout shell placement", () => {
    it("composes New Layout vertical controls into a full-width workspace bar", () => {
        expect(getDesktopShellPlacement({
            launcherPaneIsHorizontal: false,
            isNewLayout: true,
            isElectron: false,
            hasNativeTitleBar: true,
            windowControlsOnLeft: false
        })).toEqual({
            fullWidthTabBar: true,
            globalControlsInWorkspaceBar: true,
            quickSearchInWorkspaceBar: true
        });
    });

    it("keeps Classic vertical placement unless Electron window controls need full-width tabs", () => {
        expect(getDesktopShellPlacement({
            launcherPaneIsHorizontal: false,
            isNewLayout: false,
            isElectron: false,
            hasNativeTitleBar: true,
            windowControlsOnLeft: false
        })).toEqual({
            fullWidthTabBar: false,
            globalControlsInWorkspaceBar: false,
            quickSearchInWorkspaceBar: false
        });

        expect(getDesktopShellPlacement({
            launcherPaneIsHorizontal: false,
            isNewLayout: false,
            isElectron: true,
            hasNativeTitleBar: false,
            windowControlsOnLeft: true
        }).fullWidthTabBar).toBe(true);
    });

    it("keeps horizontal launchers separate while tabs span full width", () => {
        expect(getDesktopShellPlacement({
            launcherPaneIsHorizontal: true,
            isNewLayout: true,
            isElectron: false,
            hasNativeTitleBar: true,
            windowControlsOnLeft: false
        })).toEqual({
            fullWidthTabBar: true,
            globalControlsInWorkspaceBar: false,
            quickSearchInWorkspaceBar: false
        });
    });
});
