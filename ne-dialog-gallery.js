const dialogTemplate = document.createElement("template");

dialogTemplate.innerHTML = String.raw`
<dialog>
  <section>
    <img class="ne-dialogImage" src="" alt="Image" />
    <form class="ne-dialogForm" action="#">
      <button type="button" class="ne-dialogPrev">←</button>
      <nav class="ne-dialogNav"></nav>
      <button type="button" class="ne-dialogNext">→</button>
      <button type="button" class="ne-dialogClose">Close</button>
    </form>
  </section>
</dialog>
`;

export class NeDialogGallery extends HTMLElement {
  #radios = [];
  #dialogForm;
  #listeners = new ListenerStore(); // to remove on disconnect {el, type, listener}

  connectedCallback() {
    this.setup();
  }

  disconnectedCallback() {
    this.#listeners.clear();
  }

  setup() {
    // Render thumbnails as anchors with images as children just like the original content but switch out the href to target an id within the dialog, also add event listeners to open the dialog when clicked
    const df = dialogTemplate.content.cloneNode(true);
    const dialog = df.querySelector("dialog");
    this.appendChild(dialog);

    const dialogForm = dialog.querySelector("form");
    const dialogImage = dialog.querySelector(".ne-dialogImage");
    const dialogNav = dialog.querySelector(".ne-dialogNav");
    const dialogClose = dialog.querySelector(".ne-dialogClose");
    this.#dialogForm = dialogForm;

    const thumbnails = this.querySelectorAll("a");
    thumbnails.forEach((thumb, i) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "image";
      radio.id = `radio_${i}`;
      radio.value = thumb.href;
      dialogNav.append(radio);
      this.#radios.push(radio);

      const handleClick = (e) => {
        if (e.metaKey) {
          return;
        }
        e.preventDefault();
        dialog.showModal();
        dialogImage.src = thumb.href;
        dialogImage.setAttribute(
          "hint-img-width",
          thumb.getAttribute("hint-img-width")
        );
        radio.checked = true;
        radio.focus();
        dialogForm.dispatchEvent(new Event("change"));
      };

      this.#listeners.add({ el: thumb, type: "click", cb: handleClick });
    });

    // Use keyboard navigation to navigate the images anywhere within the dialog
    this.#listeners.add({
      el: dialog,
      type: "keydown",
      cb: ({ key }) =>
        (key === "ArrowLeft" && this.navigate("prev")) ||
        (key === "ArrowRight" && this.navigate("next")),
    });

    // Use the prev and next buttons to navigate the images
    const prevBtn = dialog.querySelector(".ne-dialogPrev");
    const nextBtn = dialog.querySelector(".ne-dialogNext");
    this.#listeners.add({
      el: prevBtn,
      type: "click",
      cb: () => this.navigate("prev"),
    });
    this.#listeners.add({
      el: nextBtn,
      type: "click",
      cb: () => this.navigate("next"),
    });

    // Use the radio buttons to navigate the images
    this.#listeners.add({
      el: dialogForm,
      type: "change",
      cb: () => {
        const radioValue = dialogForm.elements.namedItem("image").value;
        if (radioValue) {
          dialogImage.src = radioValue;
        }
      },
    });

    // Light dismiss the dialog when clicking on the backdrop
    this.#listeners.add({
      el: dialog,
      type: "click",
      cb: ({ target: { nodeName } }) =>
        nodeName === "DIALOG" && dialog.close("dismiss"),
    });

    // Close with the close button
    this.#listeners.add({
      el: dialogClose,
      type: "click",
      cb: () => dialog.close(),
    });

    // Close the dialog when the dialog is closed
    this.#listeners.add({
      el: dialog,
      type: "close",
      cb: () => (dialogImage.src = ""),
    });
  }

  // Reusable method to navigate using the arrow keys or prev/next buttons
  navigate(direction) {
    const current = this.#radios.findIndex((radio) => radio.checked);
    if (direction === "prev") {
      const prevIndex = current === 0 ? this.#radios.length - 1 : current - 1;
      this.#radios[prevIndex].checked = true;
    } else if (direction === "next") {
      const nextIndex = current === this.#radios.length - 1 ? 0 : current + 1;
      this.#radios[nextIndex].checked = true;
    }

    this.#dialogForm.dispatchEvent(new Event("change"));
  }
}

// A simple store to manage event listeners, created to easily remove listeners on disconnectedCallback
class ListenerStore {
  #listeners = [];

  add(listener) {
    const { el, type, cb } = listener;
    el.addEventListener(type, cb);
    this.#listeners.push(listener);
  }

  remove(listener) {
    const { el, type, cb } = listener;
    el.removeEventListener(type, cb);
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }

  clear() {
    this.#listeners.forEach(({ el, type, cb }) => {
      el.removeEventListener(type, cb);
    });
    this.#listeners = [];
  }
}
