const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const githubRepertory = "github.com/AmagiSakuya/Kobuichi_Collection";
const tableDirRootInAsset = "img";
const outPutDirName = ".wiki";
const WikiRootFileName = "Home";
const branch = "master";

/**Main */
let picBasePath = `${githubRepertory}/raw/${branch}/Assets/${tableDirRootInAsset}`;
let wikiOutputPath = path.resolve(__dirname, outPutDirName);
fse.ensureDirSync(wikiOutputPath);
fse.emptyDirSync(wikiOutputPath);
let rootPath = path.resolve(__dirname, `Assets/${tableDirRootInAsset}`);
CreateMDByDir(WikiRootFileName, rootPath);


/**function */
function CreateMDByDir(MDfileName, dirPath) {
    let m_files = [];
    let m_dirs = [];

    fs.readdirSync(dirPath).map((fileName) => {
        var stat = fs.lstatSync(path.resolve(dirPath, fileName));
        if (stat.isDirectory()) m_dirs.push(fileName);
        else m_files.push(fileName);
    });

    if (m_files.length > 0) {
        //CreateMD
        let MDContent = `Year | Preview | Source | Own |
---------|----------|---------| ---------
`;
        m_files.map((fileName) => {
            let m_path = path.resolve(dirPath, fileName);
            let m_ext = path.extname(m_path);
            let m_pureFileName = path.basename(m_path, m_ext);
            let dataArr = m_pureFileName.split("#");
            if (dataArr.length < 2 || dataArr.length > 3) return;
            let m_year = dataArr[0];
            let m_showName = dataArr[1];
            let m_own = dataArr.length === 3 ? true : false;
            let m_src = path.join(picBasePath, dirPath.split(tableDirRootInAsset)[1], fileName);
            let m_column = `${m_year} | <div align="center"><img src="https://${encodeURI(m_src.replace(/\\/g, "/"))}"></div> | ${m_showName} | ${m_own ? "○" : ""}
`;
            MDContent += m_column;
        });
        let m_outputMDPath = path.resolve(wikiOutputPath, `${MDfileName}.MD`);
        fs.writeFileSync(m_outputMDPath, MDContent);
    }

    if (m_dirs.length > 0) {
        m_dirs.map((dirName) => {
            CreateMDByDir(dirName, path.resolve(dirPath, dirName));
        });
    }
}