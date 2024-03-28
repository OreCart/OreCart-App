import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import { type AppDispatch, type RootState } from "../app/store";

/**
 * Wrapper around useDispatch with proper typing. Use this instead of useDispatch.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Wrapper around useAppSelector with proper typing. Use this instead of useSelector.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
