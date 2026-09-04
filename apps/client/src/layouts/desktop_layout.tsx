import "./desktop_layout.css";

import type { AppContext } from "../components/app_context.js";
import type { WidgetsByParent } from "../services/bundle.js";
import { isExperimentalFeatureEnabled } from "../services/experimental_features.js";
import options from "../services/options.js";
import utils from "../services/utils.js";
import ApiLog from "../widgets/api_log.jsx";
import ClosePaneButton from "../widgets/buttons/close_pane_button.js";
import CreatePaneButton from "../widgets/buttons/create_pane_button.js";
import GlobalMenu from "../widgets/buttons/global_menu.jsx";
import LeftPaneToggle from "../widgets/buttons/left_pane_toggle.js";
import MovePaneButton from "../widgets/buttons/move_pane_button.js";
import RightPaneToggle from "../widgets/buttons/right_pane_toggle.jsx";
import CloseZenModeButton from "../widgets/close_zen_button.jsx";
import NoteList from "../widgets/collections/NoteList.jsx";
import ContentHeader from "../widgets/containers/content_header.js";
import FlexContainer from "../widgets/containers/flex_container.js";
import LeftPaneContainer from "../widgets/containers/left_pane_container.js";
import RightPaneContainer from "../widgets/containers/right_pane_container.js";
import RootContainer from "../widgets/containers/root_container.js";
import ScrollingContainer from "../widgets/containers/scrolling_container.js";
import SplitNoteContainer from "../widgets/containers/split_note_container.js";
import PasswordNoteSetDialog from "../widgets/dialogs/password_not_set.js";
import UploadAttachmentsDialog from "../widgets/dialogs/upload_attachments.js";
import FindWidget from "../widgets/find.js";
import FloatingButtons from "../widgets/FloatingButtons.jsx";
import { DESKTOP_FLOATING_BUTTONS } from "../widgets/FloatingButtonsDefinitions.jsx";
import HighlightsListWidget from "../widgets/highlights_list.js";
import LauncherContainer from "../widgets/launch_bar/LauncherContainer.jsx";
import SpacerWidget from "../widgets/launch_bar/SpacerWidget.jsx";
import InlineTitle from "../widgets/layout/InlineTitle.jsx";
import NoteBadges from "../widgets/layout/NoteBadges.jsx";
import NoteTitleActions from "../widgets/layout/NoteTitleActions.jsx";
import StatusBar from "../widgets/layout/StatusBar.jsx";
import NoteIconWidget from "../widgets/note_icon.jsx";
import NoteTitleWidget from "../widgets/note_title.jsx";
import NoteTreeWidget from "../widgets/note_tree.js";
import NoteWrapperWidget from "../widgets/note_wrapper.js";
import NoteDetail from "../widgets/NoteDetail.jsx";
import PromotedAttributes from "../widgets/PromotedAttributes.jsx";
import QuickSearchWidget from "../widgets/quick_search.js";
import ReadOnlyNoteInfoBar from "../widgets/ReadOnlyNoteInfoBar.jsx";
import { FixedFormattingToolbar } from "../widgets/ribbon/FormattingToolbar.jsx";
import LazyComponent from "../widgets/react/LazyComponent.jsx";
import NoteActions from "../widgets/ribbon/NoteActions.jsx";
import ScrollPadding from "../widgets/scroll_padding.js";
import SearchResult from "../widgets/search_result.jsx";
import SharedInfo from "../widgets/shared_info.jsx";
import RightPanelContainer from "../widgets/sidebar/RightPanelContainer.jsx";
import TabRowWidget from "../widgets/tab_row.js";
import TabHistoryNavigationButtons from "../widgets/TabHistoryNavigationButtons.jsx";
import TocWidget from "../widgets/toc.js";
import WatchedFileUpdateStatusWidget from "../widgets/watched_file_update_status.js";
import { applyModals } from "./layout_commons.js";

export default class DesktopLayout {

    private customWidgets: WidgetsByParent;

    constructor(customWidgets: WidgetsByParent) {
        this.customWidgets = customWidgets;
    }

    getRootWidget(appContext: AppContext) {
        appContext.noteTreeWidget = new NoteTreeWidget();

        const launcherPaneIsHorizontal = options.get("layoutOrientation") === "horizontal";
        const isNewLayout = isExperimentalFeatureEnabled("new-layout");
        const isElectron = utils.isElectron();
        const hasNativeTitleBar = window.glob.hasNativeTitleBar;
        const placement = getDesktopShellPlacement({
            launcherPaneIsHorizontal,
            isNewLayout,
            isElectron,
            hasNativeTitleBar,
            windowControlsOnLeft: isElectron && utils.areWindowControlsOnLeft()
        });
        const launcherPane = this.#buildLauncherPane(launcherPaneIsHorizontal, isNewLayout);
        const layoutClassName = launcherPaneIsHorizontal ? "horizontal-layout" : "vertical-layout";
        const rootClassName = isNewLayout
            ? `${layoutClassName} knowledge-studio-shell`
            : layoutClassName;
        const noteBarClassName = isNewLayout
            ? "title-row note-split-title knowledge-studio-note-bar"
            : "title-row note-split-title";

        /**
         * New Layout uses a full-width tab row as its workspace bar. Classic keeps tabs in the rest
         * pane unless the launcher is horizontal or Electron window controls need the full width.
         */
        const quickSearch = new QuickSearchWidget();

        const rootContainer = new RootContainer(true)
            .setParent(appContext)
            .class(rootClassName)
            .optChild(
                placement.fullWidthTabBar,
                new FlexContainer("row")
                    .class(`tab-row-container${isNewLayout ? " knowledge-studio-workspace-bar" : ""}`)
                    .child(new FlexContainer("row").id("tab-row-left-spacer"))
                    .optChild(
                        placement.globalControlsInWorkspaceBar,
                        new FlexContainer("row")
                            .class("knowledge-studio-workspace-leading")
                            .child(<GlobalMenu isHorizontalLayout={true} />)
                            .child(<LeftPaneToggle isHorizontalLayout={true} />)
                            .child(quickSearch)
                    )
                    .optChild(launcherPaneIsHorizontal, <LeftPaneToggle isHorizontalLayout={true} />)
                    .child(<TabHistoryNavigationButtons />)
                    .child(new TabRowWidget().class("full-width"))
                    .optChild(isNewLayout, <RightPaneToggle />)
                    .css("height", "40px")
                    .css("background-color", "var(--launcher-pane-background-color)")
                    .setParent(appContext)
            )
            .optChild(launcherPaneIsHorizontal, launcherPane)
            .child(
                new FlexContainer("row")
                    .css("flex-grow", "1")
                    .id("horizontal-main-container")
                    .optChild(!launcherPaneIsHorizontal, launcherPane)
                    .child(
                        new LeftPaneContainer()
                            .optChild(
                                !placement.quickSearchInWorkspaceBar && !launcherPaneIsHorizontal,
                                quickSearch
                            )
                            .child(appContext.noteTreeWidget)
                            .child(...this.customWidgets.get("left-pane"))
                    )
                    .child(
                        new FlexContainer("column")
                            .id("rest-pane")
                            .class(isNewLayout ? "knowledge-studio-workspace" : "")
                            .css("flex-grow", "1")
                            .optChild(!placement.fullWidthTabBar,
                                new FlexContainer("row")
                                    .class("tab-row-container")
                                    .child(<TabHistoryNavigationButtons />)
                                    .child(new TabRowWidget())
                                    .optChild(isNewLayout, <RightPaneToggle />)
                                    .css("height", "40px")
                                    .css("align-items", "center")
                            )
                            .optChild(isNewLayout, <FixedFormattingToolbar />)
                            .child(
                                new FlexContainer("row")
                                    .filling()
                                    .collapsible()
                                    .id("vertical-main-container")
                                    .class(isNewLayout ? "knowledge-studio-main-stage" : "")
                                    .child(
                                        new FlexContainer("column")
                                            .filling()
                                            .collapsible()
                                            .id("center-pane")
                                            .class(isNewLayout ? "knowledge-studio-canvas" : "")
                                            .child(
                                                new SplitNoteContainer(() =>
                                                    new NoteWrapperWidget()
                                                        .child(new FlexContainer("row")
                                                            .class(noteBarClassName)
                                                            .cssBlock(".title-row > * { margin: 5px; }")
                                                            .child(<NoteIconWidget />)
                                                            .child(<NoteTitleWidget />)
                                                            .optChild(isNewLayout, <NoteBadges />)
                                                            .child(<SpacerWidget baseSize={0} growthFactor={1} />)
                                                            .optChild(!isNewLayout, <MovePaneButton direction="left" />)
                                                            .optChild(!isNewLayout, <MovePaneButton direction="right" />)
                                                            .optChild(!isNewLayout, <ClosePaneButton />)
                                                            .optChild(!isNewLayout, <CreatePaneButton />)
                                                            .optChild(isNewLayout, <NoteActions />))
                                                        .optChild(!isNewLayout, <LazyComponent loader={() => import("../widgets/ribbon/Ribbon.jsx")} />)
                                                        .child(new WatchedFileUpdateStatusWidget())
                                                        .optChild(!isNewLayout, <FloatingButtons items={DESKTOP_FLOATING_BUTTONS} />)
                                                        .child(
                                                            new ScrollingContainer()
                                                                .filling()
                                                                .optChild(isNewLayout, <InlineTitle />)
                                                                .optChild(isNewLayout, <NoteTitleActions />)
                                                                .optChild(!isNewLayout, new ContentHeader()
                                                                    .child(<ReadOnlyNoteInfoBar />)
                                                                    .child(<SharedInfo />)
                                                                )
                                                                .optChild(!isNewLayout, <PromotedAttributes />)
                                                                .child(<NoteDetail />)
                                                                .child(<NoteList media="screen" />)
                                                                .child(<SearchResult />)
                                                                .child(<ScrollPadding />)
                                                        )
                                                        .child(<ApiLog />)
                                                        .child(new FindWidget())
                                                        .child(...this.customWidgets.get("note-detail-pane"))
                                                ).class(isNewLayout ? "knowledge-studio-splits" : "")
                                            )
                                            .child(...this.customWidgets.get("center-pane"))

                                    )
                                    .optChild(!isNewLayout,
                                        new RightPaneContainer()
                                            .child(new TocWidget())
                                            .child(new HighlightsListWidget())
                                            .child(...this.customWidgets.get("right-pane"))
                                    )
                                    .optChild(isNewLayout, <RightPanelContainer widgetsByParent={this.customWidgets} />)
                            )
                            .optChild(!launcherPaneIsHorizontal && isNewLayout, <StatusBar />)
                    )
            )
            .optChild(launcherPaneIsHorizontal && isNewLayout, <StatusBar />)
            .child(<CloseZenModeButton />)

            // Desktop-specific dialogs.
            .child(<PasswordNoteSetDialog />);

        applyModals(rootContainer);
        return rootContainer;
    }

    #buildLauncherPane(isHorizontal: boolean, isNewLayout: boolean) {
        let launcherPane;

        if (isHorizontal) {
            launcherPane = new FlexContainer("row")
                .css("height", "53px")
                .class("horizontal")
                .child(<LauncherContainer isHorizontalLayout={true} />)
                .child(<GlobalMenu isHorizontalLayout={true} />);
        } else {
            launcherPane = new FlexContainer("column")
                .css("width", "53px")
                .class("vertical")
                .optChild(!isNewLayout, <GlobalMenu isHorizontalLayout={false} />)
                .child(<LauncherContainer isHorizontalLayout={false} />)
                .optChild(!isNewLayout, <LeftPaneToggle isHorizontalLayout={false} />);
        }

        launcherPane.id("launcher-pane");
        return launcherPane;
    }
}

interface DesktopShellPlacementOptions {
    launcherPaneIsHorizontal: boolean;
    isNewLayout: boolean;
    isElectron: boolean;
    hasNativeTitleBar: boolean;
    windowControlsOnLeft: boolean;
}

export function getDesktopShellPlacement({
    launcherPaneIsHorizontal,
    isNewLayout,
    isElectron,
    hasNativeTitleBar,
    windowControlsOnLeft
}: DesktopShellPlacementOptions) {
    const globalControlsInWorkspaceBar = isNewLayout && !launcherPaneIsHorizontal;

    return {
        fullWidthTabBar: isNewLayout
            || launcherPaneIsHorizontal
            || (isElectron && !hasNativeTitleBar && windowControlsOnLeft),
        globalControlsInWorkspaceBar,
        quickSearchInWorkspaceBar: globalControlsInWorkspaceBar
    };
}
