export type Color = "black" | "dark_blue" | "dark_green" | "dark_aqua" | "dark_red" | "dark_purple" | "gold" | "gray" | "dark_gray" | "blue" | "green" | "aqua" | "red" | "light_purple" | "yellow" | "white" | "reset" | "bold" | "italic" | "underlined" | "strikethrough" | "obfuscated";

export interface SimpleTextProvider {
  text: string;
}

export interface TranslateTextProvider {
  translate: string;
  with?: (string | ComponentObject)[];
}

export interface ScoreTextProvider {
  score: {
    name: string;
    objective: string;
    value?: string;
  };
}

export interface SelectorTextProvider {
  selector: string;
}

export interface KeybindTextProvider {
  keybind: string;
}

export interface BlockTextProvider {
  nbt: string;
  interpret?: boolean;
  block: string;
}

export interface EntityTextProvider {
  nbt: string;
  interpret?: boolean;
  entity: string;
}

export interface StorageTextProvider {
  nbt: string;
  interpret?: boolean;
  storage: string;
}

export interface ClickEvent {
  action: "open_url" | "run_command" | "change_page" | "suggest_command" | "copy_to_clipboard";
  value: string;
}

export interface HoverEvent {
  action: "show_text" | "show_item" | "show_entity";
  value: Component;
}

export interface TextAttributes {
  color?: Color;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  insertion?: string;
  clickEvent?: ClickEvent;
  hoverEvent?: HoverEvent;
  extra?: Component[];
}

export type TextProvider = SimpleTextProvider | TranslateTextProvider | ScoreTextProvider | SelectorTextProvider | KeybindTextProvider | BlockTextProvider | EntityTextProvider | StorageTextProvider;
export type ComponentObject = TextProvider & TextAttributes;
export type Component = string | Component[] | ComponentObject;
