function createDialogImageListItem(src: string, alt: string, id: string) {
  const li = document.createElement("li");
  const img = document.createElement("img");
  Object.assign(img, { id, src, alt, loading: "lazy" });
  li.appendChild(img);
  return li;
}

function createDialogAnchorListItem(id: string) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = `#${id}`;

  li.appendChild(a);
  return li;
}
const dialogTemplate = document.createElement("template");

dialogTemplate.innerHTML = String.raw`
<dialog>
  <section>
    <ul id="dialogImageList">
    </ul>
    <nav id="dialogNav">
      <button type="button" id="prev">&lt;</button>
      <ul id="dialogNavList">
      </ul>
      <button type="button" id="next">&gt;</button>
    </nav>
    <button type="button" id="closeBtn">Close</button>
  </section>
</dialog>
`;

export class NeDialogGallery extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setup();
  }

  setup() {
    const df = dialogTemplate.content.cloneNode(true) as DocumentFragment;
    const dialog = df.querySelector("dialog")! as HTMLDialogElement;

    const dialogImageList = dialog.querySelector(
      "#dialogImageList"
    )! as HTMLUListElement;
    const dialogNavList = dialog.querySelector(
      "#dialogNavList"
    )! as HTMLUListElement;
    const dialogClose = dialog.querySelector("#closeBtn")!;

    const thumbnails = this.querySelectorAll("a");
    thumbnails.forEach((thumbnail, i) => {
      const image = thumbnail.querySelector("img")! as HTMLImageElement;
      const imageLI = createDialogImageListItem(
        thumbnail.href,
        image.alt,
        `dialogImage_${i}`
      );
      dialogImageList.appendChild(imageLI);

      const anchorLi = createDialogAnchorListItem(`dialogImage_${i}`);
      dialogNavList.appendChild(anchorLi);

      thumbnail.addEventListener("click", (e) => {
        if (e.metaKey) {
          return;
        }
        e.preventDefault();
        dialog.showModal(); // maybe open dialog during capture phase..
        imageLI.scrollIntoView({ behavior: "smooth" });
        anchorLi.focus();
      });
    });

    // Light dismiss the dialog when clicking on the backdrop
    dialog.addEventListener("click", (e: Event) => {
      if ((e.target as HTMLElement).nodeName === "DIALOG")
        dialog.close("dismiss");
    });

    // dialog.addEventListener("close", () => {
    //   dialogImage.src = "";
    // });

    // Close with the close button
    dialogClose.addEventListener("click", () => dialog.close());

    this.appendChild(dialog);
  }
}
