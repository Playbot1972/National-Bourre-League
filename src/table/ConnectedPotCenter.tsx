import { memo } from "react";
import { PotCenter } from "./PotCenter";
import { useExternalStoreSelector } from "./hooks/useExternalStoreSelector";
import {
  getTrickPresentationSnapshot,
  subscribeTrickPresentation,
} from "./trickPresentationStore";
import {
  selectTrickCenterProps,
  trickCenterPropsEqual,
  type TrickCenterProps,
} from "./trickPresentationSelectors";
import type { ComponentProps } from "react";

type PotCenterBaseProps = Omit<
  ComponentProps<typeof PotCenter>,
  keyof TrickCenterProps
>;

function ConnectedPotCenterInner(props: PotCenterBaseProps) {
  const trickProps = useExternalStoreSelector(
    subscribeTrickPresentation,
    getTrickPresentationSnapshot,
    selectTrickCenterProps,
    trickCenterPropsEqual,
  );

  return <PotCenter {...props} {...trickProps} />;
}

export const ConnectedPotCenter = memo(ConnectedPotCenterInner);
