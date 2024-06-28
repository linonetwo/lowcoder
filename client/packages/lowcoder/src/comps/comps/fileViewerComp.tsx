import { styleControl } from "comps/controls/styleControl";
import { AnimationStyle, AnimationStyleType, FileViewerStyle, FileViewerStyleType, heightCalculator, widthCalculator } from "comps/controls/styleControlConstants";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { DocumentViewer } from "react-documents";
import styled, { css } from "styled-components";
import { Section, sectionNames } from "lowcoder-design";
import { StringControl } from "../controls/codeControl";
import { UICompBuilder } from "../generators";
import { NameConfig, NameConfigHidden, withExposingConfigs } from "../generators/withExposing";
import { hiddenPropertyView } from "comps/utils/propertyUtils";
import { trans } from "i18n";

import { useContext } from "react";
import { EditorContext } from "comps/editorState";
import { CompTypeContext } from "@lowcoder-ee/comps/utils/compTypeContext";
import { setInitialCompStyles } from "@lowcoder-ee/comps/utils/themeUtil";
import { ThemeContext } from "@lowcoder-ee/comps/utils/themeContext";
import { useMergeCompStyles } from "@lowcoder-ee/index.sdk";

const getStyle = (style: FileViewerStyleType) => {
  return css`
    width: ${widthCalculator(style.margin)};	
    height: ${heightCalculator(style.margin)};	
    margin: ${style.margin};	
    padding: ${style.padding};

    overflow: hidden;
    background-color: ${style.background};
    border: ${(props) => (style.borderWidth ? style.borderWidth : "1px")} solid ${style.border};
    border-radius: calc(min(${style.radius}, 20px));
  `;
};

const ErrorWrapper = styled.div<{$style: FileViewerStyleType, $animationStyle:AnimationStyleType}>`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  ${(props) => props.$style && getStyle(props.$style)}
  ${(props) => props.$animationStyle}
`;

const StyledDiv = styled.div<{$style: FileViewerStyleType;}>`
  height: 100%;
  ${(props) => props.$style && getStyle(props.$style)}
`;

const DraggableFileViewer = (props: { src: string; style: FileViewerStyleType,animationStyle:AnimationStyleType }) => {
  const [isActive, setActive] = useState(false);

  return (
    <StyledDiv
      $style={props.style}
      onClick={(e) => setActive(true)}
      onMouseLeave={(e) => setActive(false)}
    >
      <DocumentViewer
        style={{
          pointerEvents: isActive ? "auto" : "none",
          width: "100%",
          height: "100%",
        }}
        url={props.src}
        viewer={"url"}
      />
    </StyledDiv>
  );
};

let FileViewerBasicComp = (function () {
  const childrenMap = {
    src: StringControl,
    style: styleControl(FileViewerStyle , 'style'),
    animationStyle: styleControl(AnimationStyle , 'animationStyle'),
  };
  return new UICompBuilder(childrenMap, (props, dispatch) => {
    useMergeCompStyles(props as Record<string, any>, dispatch);
    
    if (isEmpty(props.src)) {
      return (
        <ErrorWrapper
          $style={props.style}
          $animationStyle={props.animationStyle}
        >
          {trans('fileViewer.invalidURL')}
        </ErrorWrapper>
      );
    }
    return <DraggableFileViewer src={props.src} style={props.style} animationStyle={props.animationStyle}/>;
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          <Section name={sectionNames.basic}>
            {children.src.propertyView({
              label: trans("fileViewer.src"),
              tooltip: (
                <span>{trans("fileViewer.srcTooltip")}</span>
              ),
            })}
          </Section>

          {["logic", "both"].includes(useContext(EditorContext).editorModeStatus) && (
            <Section name={sectionNames.interaction}>
              {hiddenPropertyView(children)}
            </Section>
          )}

          {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
            <>
              <Section name={sectionNames.style}>
              {children.style.getPropertyView()}
              </Section>
              <Section name={sectionNames.animationStyle} hasTooltip={true}>
              {children.animationStyle.getPropertyView()}
              </Section>
              </>
          )}
        </>
      );
    })
    .build();
})();

FileViewerBasicComp = class extends FileViewerBasicComp {
  override autoHeight(): boolean {
    return false;
  }
};

export const FileViewerComp = withExposingConfigs(FileViewerBasicComp, [
  new NameConfig("src", trans("fileViewer.srcDesc")),
  NameConfigHidden,
]);
