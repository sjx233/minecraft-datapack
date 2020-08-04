interface SimpleTextProvider {
  text: string;
}

interface TranslatableTextProvider {
  translate: string;
  with?: (string | SimpleTextProvider)[];
}

interface ScoreTextProvider {
  score: {
    name: string;
    objective: string;
  };
}

interface SelectorTextProvider {
  selector: string;
}

interface KeybindTextProvider {
  keybind: string;
}

interface BlockTextProvider {
  nbt: string;
  interpret?: boolean;
  block: string;
}

interface EntityTextProvider {
  nbt: string;
  interpret?: boolean;
  entity: string;
}

interface StorageTextProvider {
  nbt: string;
  interpret?: boolean;
  storage: string;
}

interface ClickEvent {
  action: "open_url" | "run_command" | "suggest_command" | "change_page" | "copy_to_clipboard";
  value: string;
}

interface ShowTextEvent {
  action: "show_text";
  value: Component;
}

interface ShowItemEvent {
  action: "show_item";
  value: string | { id: string; count?: number; tag?: string; };
}

interface ShowEntityEvent {
  action: "show_entity";
  value: { type: string; id: string; name: Component; };
}

type HoverEvent = ShowTextEvent | ShowItemEvent | ShowEntityEvent;

interface TextAttributes {
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  color?: string;
  insertion?: string;
  clickEvent?: ClickEvent;
  hoverEvent?: HoverEvent;
  font?: string;
  extra?: Component[];
}

type TextProvider =
  | SimpleTextProvider
  | TranslatableTextProvider
  | ScoreTextProvider
  | SelectorTextProvider
  | KeybindTextProvider
  | BlockTextProvider
  | EntityTextProvider
  | StorageTextProvider;
type ComponentObject = TextProvider & TextAttributes;
export type Component = string | number | boolean | ComponentObject | Component[];
