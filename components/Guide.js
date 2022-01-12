import { useState, useEffect } from "react";
import cloneDeep from "lodash/cloneDeep";
import styles from "../styles/Guide.module.css";
import * as markerjs2 from "markerjs2";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";

const Guide = ({
  imgHostOrigin = "https://i.img.guide",
  imgPathPrefix = "/test",
  slug,
  edit = false,
}) => {
  let imgRefs = [];
  const [editing, setEditing] = useState(false);
  // get "editing" in the correct default state for the initial render client side
  useEffect(() => setEditing(edit), []);

  const [imgState, setImgState] = useState([]);

  const [data, setData] = useState({ title: "Loading...", steps: [] });
  const { title, description, steps } = data;

  useEffect(() => {
    async function fetchGuide() {
      if (!slug) return;
      let res;
      try {
        res = await window.fetch(
          `${imgHostOrigin}${imgPathPrefix}/guide/${slug}`
        );
      } catch (err) {
        console.error(err);
        setData({
          title: "Failed to load guide.",
          description: "Failed to fetch",
          steps: [],
        });
      }
      let guide;
      try {
        guide = await res.json();
      } catch (err) {
        console.error(err);
        setData({
          title: "Failed to load guide.",
          description: "Failed to parse JSON",
          steps: [],
        });
        return;
      }
      if (res.status === 200) {
        setData(guide);
        setImgState(new Array(guide.steps.length).fill(0));
      } else {
        setData({
          title: "Failed to load guide.",
          description: "Guide not found (404)",
          steps: [],
        });
      }
    }
    fetchGuide();
  }, [slug]);

  // add helper functions to window for easier browser debugging
  if (typeof window !== "undefined") {
    window.setData = () => setData(window.data);
    window.getData = () => {
      window.data = data;
      console.log("saved as window.data", data);
    };
  }

  async function save() {
    const email = window.localStorage.getItem("email");
    const password = window.localStorage.getItem("password");
    if (!email || !password) {
      alert("Email or password is not defined");
      return false;
    }
    console.log(`${email}:${password}`);
    window.fetch(`https://i.img.guide/upload`, {
      method: "POST",
      headers: {
        "x-img-guide-path": `guide/${slug}`,
        authorization: `Basic ${btoa(`${email}:${password}`)}`,
      },
      body: JSON.stringify(data),
    });
  }

  function showMarkerArea(stepIndex, imgIndex) {
    const img = imgRefs[stepIndex];
    if (!img) return;
    const markerArea = new markerjs2.MarkerArea(img);
    markerArea.addEventListener("render", (event) => {
      if (!img) return;
      console.log(JSON.stringify(event.state));
      const image = new Image();
      image.src = event.dataUrl;
      image.onload = () => {
        resize(image, async (resizedImg) => {
          const filename = data.steps[stepIndex].images[imgIndex].filename;
          await upload(resizedImg, `${filename}_thumb`);
          const newData = cloneDeep(data);
          newData.steps[stepIndex].images[imgIndex] = {
            filename,
            markers: event.state,
          };
          setData(newData);
        });
      };
    });
    markerArea.show();
  }

  async function upload(data, filename) {
    const email = window.localStorage.getItem("email");
    const password = window.localStorage.getItem("password");
    if (!email || !password) {
      alert("Email or password is not defined");
      return false;
    }
    const uploadRes = await window.fetch("https://i.img.guide/upload", {
      method: "POST",
      headers: {
        authorization: `Basic ${btoa(`${email}:${password}`)}`,
        "x-img-guide-path": `img/${filename}`,
      },
      body: data,
    });

    if (uploadRes.status !== 200) return "ERROR";
    await uploadRes.json();
    return "SUCCESS";
  }

  async function resize(image, callback = () => {}) {
    // Resize the image
    const canvas = document.createElement("canvas"),
      max_size = 800,
      width = image.width,
      height = image.height;
    if (width > height) {
      if (width > max_size) {
        height *= max_size / width;
        width = max_size;
      }
    } else {
      if (height > max_size) {
        width *= max_size / height;
        height = max_size;
      }
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    canvas.toBlob(
      async (blob) => {
        const resizedImg = await blob.arrayBuffer();
        callback(resizedImg);
      },
      "image/jpeg",
      0.95
    );
  }

  return (
    <div className={styles.Guide}>
      {edit && (
        <div>
          {editing ? (
            <button onClick={() => setEditing(false)}>preview</button>
          ) : (
            <button onClick={() => setEditing(true)}>edit</button>
          )}
          <button onClick={save}>save</button>
        </div>
      )}
      <h1>
        {editing ? (
          <input
            placeholder="title"
            value={title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        ) : (
          title
        )}
      </h1>
      <p>
        {editing ? (
          <TextareaAutosize
            style={{ width: "100%" }}
            value={description}
            placeholder="description"
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        ) : (
          <ReactMarkdown>{description}</ReactMarkdown>
        )}
      </p>
      {steps.map((step, stepIndex) => (
        <div className={styles.Step} key={stepIndex}>
          <h2>
            <b>Step {stepIndex + 1}</b>{" "}
            {editing ? (
              <input
                value={step.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    steps: [
                      ...data.steps.slice(0, stepIndex),
                      { ...step, title: e.target.value },
                      ...data.steps.slice(stepIndex + 1),
                    ],
                  })
                }
              />
            ) : (
              step.title
            )}
          </h2>
          <div className={styles.StepLayout}>
            <div className={styles.StepImg}>
              <img
                crossOrigin="anonymous"
                ref={(node) => (imgRefs[stepIndex] = node)}
                src={
                  imgHostOrigin +
                  imgPathPrefix +
                  "/img/" +
                  step.images[imgState[stepIndex] || 0]?.filename +
                  "_thumb"
                }
                alt="sample"
                onClick={() => showMarkerArea(stepIndex, imgState[stepIndex])}
              />
            </div>
            <div className={styles.StepLines}>
              {step.images.length > 1 && (
                <div className={styles.StepImgThumbnails}>
                  {step.images.map((image, imageIndex) => {
                    const setActiveImg = () => {
                      setImgState([
                        ...imgState.splice(0, stepIndex),
                        imageIndex,
                        ...imgState.splice(stepIndex + 1),
                      ]);
                      console.log(imgState);
                    };
                    return (
                      <img
                        onMouseEnter={setActiveImg}
                        onClick={setActiveImg}
                        key={imageIndex}
                        src={
                          imgHostOrigin +
                          imgPathPrefix +
                          "/img/" +
                          image.filename +
                          "_thumb"
                        }
                      />
                    );
                  })}
                </div>
              )}
              <ul>
                {step.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <span
                      className={styles.StepLineBullet}
                      style={{ color: line.color }}
                    >
                      <svg
                        focusable="false"
                        viewBox="0 0 512 512"
                        style={{ height: "0.75rem" }}
                      >
                        <path
                          fill="currentColor"
                          d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"
                        ></path>
                      </svg>
                    </span>
                    {editing && (
                      <input
                        value={line.color}
                        onChange={(e) => {
                          const newData = cloneDeep(data);
                          newData.steps[stepIndex].lines[lineIndex].color =
                            e.target.value;
                          setData(newData);
                        }}
                      />
                    )}
                    {editing ? (
                      <TextareaAutosize
                        style={{ width: "100%" }}
                        value={line.text}
                        onChange={(e) => {
                          const newData = cloneDeep(data);
                          newData.steps[stepIndex].lines[lineIndex].text =
                            e.target.value;
                          setData(newData);
                        }}
                      />
                    ) : (
                      <ReactMarkdown>{line.text}</ReactMarkdown>
                    )}
                  </li>
                ))}
                {editing && (
                  <>
                    <span
                      className={styles.EditButton}
                      onClick={() => {
                        const newData = cloneDeep(data);
                        newData.steps[stepIndex].lines.push({
                          color: "black",
                          text: "",
                        });
                        setData(newData);
                      }}
                    >
                      add line
                    </span>
                    <label className={styles.EditButton}>
                      <span style={{ cursor: "pointer" }}>add image</span>
                      <input
                        style={{ display: "none" }}
                        type="file"
                        onChange={(e) => {
                          const filename = crypto.randomUUID();

                          // Upload original
                          const origReader = new FileReader();
                          origReader.readAsArrayBuffer(e.target.files[0]);
                          origReader.onload = async (readerEvent) => {
                            const file = readerEvent.target.result;
                            await upload(file, filename);
                          };

                          // Upload resized version
                          const resizedReader = new FileReader();
                          resizedReader.readAsDataURL(e.target.files[0]);
                          resizedReader.onload = async (readerEvent) => {
                            const image = new Image();
                            image.src = readerEvent.target.result;
                            image.onload = () => {
                              resize(image, async (resizedImg) => {
                                await upload(resizedImg, `${filename}_thumb`);
                                const newData = cloneDeep(data);
                                newData.steps[stepIndex].images = [
                                  ...step.images,
                                  { filename, markers: {} },
                                ];
                                setData(newData);
                              });
                            };
                          };
                        }}
                      />
                    </label>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      ))}
      {editing && (
        <span
          onClick={() => {
            setData({
              ...data,
              steps: [...data.steps, { images: [], title: "", lines: [] }],
            });
            setImgState(new Array(data.steps.length).fill(0));
          }}
        >
          add step
        </span>
      )}
    </div>
  );
};

export default Guide;
