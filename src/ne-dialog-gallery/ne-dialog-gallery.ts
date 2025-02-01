const dialogTemplate = document.createElement("template");

dialogTemplate.innerHTML = String.raw`
<dialog>
  <section>
    <img id="dialogImage" src="" alt="Image" />
    <form id="dialogForm" action="#">
      <button type="button" id="prev">&lt;</button>
      <nav id="dialogNav"></nav>
      <button type="button" id="next">&gt;</button>
      <button type="button" id="closeBtn">Close</button>
    </form>
  </section>
</dialog>
`;

export class NeDialogGallery extends HTMLElement {
  #radios: HTMLInputElement[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.setup();
  }

  setup() {
    // Render thumbnails as anchors with images as children just like the original content but switch out the href to target an id within the dialog, also add event listeners to open the dialog when clicked
    const df = dialogTemplate.content.cloneNode(true) as DocumentFragment;
    const dialog = df.querySelector("dialog")! as HTMLDialogElement;
    this.appendChild(dialog);
    const dialogForm = dialog.querySelector("form")! as HTMLFormElement;
    const dialogImage = dialog.querySelector(
      "#dialogImage"
    )! as HTMLImageElement;
    const dialogNav = dialog.querySelector("#dialogNav")!;
    console.log(dialogNav);
    const dialogClose = dialog.querySelector("#closeBtn")!;

    const thumbnails = this.querySelectorAll("a");
    thumbnails.forEach((thumbnail, i) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "image";
      radio.id = `radio_${i}`;
      radio.value = thumbnail.href;
      dialogNav.append(radio);
      this.#radios.push(radio);

      thumbnail.addEventListener("click", (e) => {
        if (e.metaKey) {
          return;
        }
        e.preventDefault();
        dialog.showModal();
        dialogImage.src = thumbnail.href;
        radio.checked = true;
        radio.focus();
        dialogForm.dispatchEvent(new Event("change"));
      }); // maybe open dialog during capture phase..
    });

    // Reusable function to navigate using the arrow keys or prev/next buttons
    const navigate = (direction: "prev" | "next") => {
      const current = this.#radios.findIndex((radio) => radio.checked);
      if (direction === "prev") {
        const prevIndex = current === 0 ? this.#radios.length - 1 : current - 1;
        this.#radios[prevIndex].checked = true;
      } else if (direction === "next") {
        const nextIndex = current === this.#radios.length - 1 ? 0 : current + 1;
        this.#radios[nextIndex].checked = true;
      }

      dialogForm.dispatchEvent(new Event("change"));
    };

    // Use keyboard navigation to navigate the images anywhere within the dialog
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        navigate("prev");
      } else if (e.key === "ArrowRight") {
        navigate("next");
      }
    });

    // Use the prev and next buttons to navigate the images
    const prevButton = dialog.querySelector("#prev")!;
    prevButton.addEventListener("click", () => navigate("prev"));
    const nextButton = dialog.querySelector("#next")!;
    nextButton.addEventListener("click", () => navigate("next"));

    // Use the radio buttons to navigate the images
    dialogForm.addEventListener("change", () => {
      const radioValue = (
        dialogForm.elements.namedItem("image") as RadioNodeList
      ).value;
      if (radioValue) {
        dialogImage.src = radioValue;
      }
    });

    // Light dismiss the dialog when clicking on the backdrop
    dialog.addEventListener("click", (e: Event) => {
      if ((e.target as HTMLElement).nodeName === "DIALOG")
        dialog.close("dismiss");
    });

    dialog.addEventListener("close", () => {
      dialogImage.src = "";
    });

    // Close with the close button
    dialogClose.addEventListener("click", () => dialog.close());
  }
}
