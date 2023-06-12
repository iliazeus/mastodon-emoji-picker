const compareKeysIgnoreCase = (
  a: [string | undefined, unknown],
  b: [string | undefined, unknown]
) => {
  return (a[0] ?? "").toLocaleLowerCase().localeCompare((b[0] ?? "").toLocaleLowerCase());
};

interface CustomEmoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
  category?: string;
}

async function fetchCustomEmojis(baseUrl: string | URL): Promise<CustomEmoji[]> {
  const url = new URL("/api/v1/custom_emojis", baseUrl);
  const response = await fetch(url);
  const data: CustomEmoji[] = await response.json();
  if (!Array.isArray(data)) throw new TypeError();
  return data;
}

let _input: HTMLInputElement;
let _container: HTMLElement;

async function updateEmojiInContainer(): Promise<void> {
  let baseUrl = _input.value;
  if (!baseUrl.startsWith("https://")) baseUrl = "https://" + baseUrl;

  const emojis = await fetchCustomEmojis(baseUrl);

  const emojisByCategory = new Map<string | undefined, CustomEmoji[]>();

  for (const emoji of emojis) {
    const categoryEmojis = emojisByCategory.get(emoji.category) ?? [];
    categoryEmojis.push(emoji);
    emojisByCategory.set(emoji.category, categoryEmojis);
  }

  const divs = [...emojisByCategory].sort(compareKeysIgnoreCase).map(([category, emojis]) => {
    const div = document.createElement("div");

    const title = document.createElement("h1");
    title.innerText = category ?? "(no category)";

    const imgs = emojis.map((emoji) => {
      const img = document.createElement("img");

      img.title = ":" + emoji.shortcode + ":";
      img.src = emoji.static_url;
      img.dataset.shortcode = emoji.shortcode;

      return img;
    });

    div.replaceChildren(title, ...imgs);

    return div;
  });

  _container.replaceChildren(...divs);
}

export interface Options {
  input: HTMLInputElement;
  container: HTMLElement;
  initialUrl: string | undefined;
}

export async function register(options: Options) {
  _input = options.input;
  _container = options.container;

  if (options.initialUrl) {
    _input.value = options.initialUrl;
  }

  if (_input.value) {
    updateEmojiInContainer().catch(() => {
      _input.value = "";
    });
  }

  _input.onpaste = _input.onchange = () => {
    setTimeout(() => updateEmojiInContainer().catch((e) => console.log(e)), 0);
  };

  _container.onclick = (e) => {
    const target = e.target;
    if (!(target instanceof HTMLImageElement)) return;

    const shortcode = target.dataset.shortcode;
    navigator.clipboard.writeText(":" + shortcode + ":");
  };
}
