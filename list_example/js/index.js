"use strict";

async function getData() {
  let requestJson = null;

  try {
    const requestData = await fetch('https://jsonplaceholder.typicode.com/photos/');
    requestJson = await requestData.json();
  } catch (error) {
    console.error(error);
  }

  return requestJson.slice(0, 3);
}

// NOTE(antonio): Only display the first 5 items
function createListFromArray(jsonArray) {
  if (!(jsonArray instanceof Array)) {
    return;
  }

  const list = document.querySelector(".list-dropdown");

  for (let item of jsonArray) {
    const htmlTemplate = `
        <img src="${item.thumbnailUrl}"/> 
        <p>${item.title}</p>
    `;

    const listItem = document.createElement("li");
    listItem.innerHTML = htmlTemplate;

    list.appendChild(listItem);
  }
}

function openNav() {
  document.getElementById("sidebar-0").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("sidebar-0").style.width = "0px";
  document.getElementById("main").style.marginLeft = "0px";
}

window.onload = async () => {
  const exampleJson = await getData();
  createListFromArray(exampleJson);

  document.querySelector(".dropdown").addEventListener("click", () => {
    const currentDisplay = document.querySelector(".list-dropdown").style.display;
    const newDisplay = currentDisplay === "none" ? "block" : "none";

    document.querySelector(".list-dropdown").style.display = newDisplay;
  });
};
