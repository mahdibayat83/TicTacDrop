const importAllPages = (r) => {
    const pages = {};
    r.keys().forEach((key) => {
      const fileName = key
        .replace("./", "")
        .replace(/\.(tsx|jsx|ts|js)$/, "");
      pages[fileName] = r(key).default;
    });
    return pages;
  };
  
  export default importAllPages;