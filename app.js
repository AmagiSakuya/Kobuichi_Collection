const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const githubRepertory = "github.com/AmagiSakuya/Kobuichi_Collection";
const branch = "develop";

const tableDirRootInAsset = "img";
const WikiRootFileName = "Home";

const outPutDirName = ".wiki";


/**Main */
let picBasePath = `${githubRepertory}/raw/${branch}/Assets/${tableDirRootInAsset}`;
let wikiOutputPath = path.resolve(__dirname, outPutDirName);
fse.ensureDirSync(wikiOutputPath);
fse.emptyDirSync(wikiOutputPath);
let rootPath = path.resolve(__dirname, `Assets/${tableDirRootInAsset}`);
CreateMDByDir(WikiRootFileName, rootPath);
//分析output目录 生成TOC
let toc = Analyse_MD_Output();
CreateHomeMD(toc);

/**function */
function CreateMDByDir(MDfileName, dirPath) {
    let m_files = [];
    let m_dirs = [];

    fs.readdirSync(dirPath).map((fileName) => {
        var stat = fs.lstatSync(path.resolve(dirPath, fileName));
        if (stat.isDirectory()) m_dirs.push(fileName);
        else m_files.push(fileName);
    });

    if (m_dirs.length > 0) {
        m_dirs.map((dirName) => {
            let m_mdfileName = WikiRootFileName === MDfileName ? `${dirName}` : `${MDfileName}#${dirName}`
            CreateMDByDir(m_mdfileName, path.resolve(dirPath, dirName));
        });
    }

    // if Home Don't Create
    if (MDfileName === WikiRootFileName) {
        return;
    };

    if (m_files.length > 0) {
        //CreateMD
        let MDContent = `Year | Preview | Source | Own |
---------|----------|---------| ---------
`;
        m_files.map((fileName) => {
            let m_pureFileName = GetPureFileName(dirPath, fileName)
            let dataArr = m_pureFileName.split("#");
            if (dataArr.length < 2 || dataArr.length > 3) return;
            let m_year = dataArr[0];
            let m_showName = dataArr[1];
            let m_own = dataArr.length === 3 ? true : false;
            let m_src = path.join(picBasePath, dirPath.split(tableDirRootInAsset)[1], fileName);
            let m_column = `${m_year} | <div align="center"><img src="https://${EncodeURIComponentPath(m_src.replace(/\\/g, "/"))}"></div> | ${m_showName} | ${m_own ? "○" : ""}
`;
            MDContent += m_column;
        });

        CreateMD(MDfileName, MDContent);
    }
}

function CreateHomeMD(insertMD) {

    let m_homeMD = `# こぶいち收藏 

昨夜丶的（[@こぶいち](https://twitter.com/kobuichi)）收藏Wiki。你可以在->[这里](https://github.com/AmagiSakuya/Kobuichi_Collection/issues)参与讨论。
    
暂不重点整理エロゲ相关（スタジオメビウス / TEAM-EXODUS/ ゆずソフト）ラノベ相关（ 緋弾 / これゾン / 記憶の森のエリス / いもうとドラゴン! / お嬢様と無人島! 葉っぱ水着パラダイス / ビンボーだってプリンセス!），由于是收图向，不会特别关心商品形式，优先画集。
    
1999~2005阶段 待认真考古..

---

## 目录

${insertMD}

---

## 参考资料
    
[こぶろぐ](http://tyatsune.blog87.fc2.com/)
    
[ゆずログ: こぶいち](http://yuzu-soft.sblo.jp/category/583783-1.html)
    
[缶。](http://kuronekocan.blog59.fc2.com/)
    
[ゆずログ: むりりん](http://yuzu-soft.sblo.jp/category/583782-1.html)
    
[ゆずログ](http://yuzu-soft.sblo.jp/)`;

    CreateMD(WikiRootFileName, m_homeMD);
}

//Analyse MD Output
function Analyse_MD_Output() {
    let result = {};
    fs.readdirSync(wikiOutputPath).map((fileName) => {
        let m_tempObj = result;
        let m_pureFileName = GetPureFileName(wikiOutputPath, fileName)
        let dataArr = m_pureFileName.split("#");
        dataArr.map((m_data, m_data_index) => {
            if (m_tempObj[m_data] === void 0) {
                m_tempObj[m_data] = {};
            }
            if (m_data_index === dataArr.length - 1) {
                let m_src = EncodeURIComponentPath(`${githubRepertory}/wiki/${m_pureFileName}`)
                m_tempObj[m_data] = `https://${m_src}`;
            }
            m_tempObj = m_tempObj[m_data];
        });
    });

    let readableRes = ConverResultToReadableObject(result,0);
    return CreateTocColumn(readableRes);
}


function ConverResultToReadableObject(result,childDeep) {
    return ReadKeyOnObject(result,childDeep);

    function ReadKeyOnObject(obj,childDeep) {
        let m_keys = Object.keys(obj);
        let res = [];
        m_keys.map(key => {
            if (typeof obj[key] != "string") {
                let child = ConverResultToReadableObject(obj[key], childDeep + 1);
                res.push({ title: key, child, childDeep });
            } else {
                res.push({ title: key, url: obj[key], childDeep });
            }
        });
        return res;
    }

}

function CreateTocColumn(readableRes) {

    return CreateMD(readableRes);

    function CreateMD(res) {
        let tap = decodeURI("%20%20%20%20");
        let md = "";
        res.map(item => {
            for(i = 0;i<item.childDeep;i++){
                md+=tap;
            }
            if (item.child !== void 0) {
                md += `- ${item.title}
`;
                md += CreateMD(item.child);
            } else {
                md += `- [${item.title}](${item.url})
`;
            }
        });
        return md;
    }
}

function GetPureFileName(filepath, fileName) {
    let m_path = path.resolve(filepath, fileName)
    let m_ext = path.extname(m_path);
    return path.basename(m_path, m_ext);
}

//EncodeURI路径
function EncodeURIComponentPath(stringPath) {
    let arr = stringPath.split("/");
    let m_stringPath = "";
    arr.map((pathItem, pathItemIndex) => {
        m_stringPath += encodeURIComponent(pathItem);
        if (pathItemIndex != arr.length - 1) m_stringPath += "/";
    });
    return m_stringPath;
}

function CreateMD(fileName, content) {
    let m_outputMDPath = path.resolve(wikiOutputPath, `${fileName}.MD`);
    fs.writeFileSync(m_outputMDPath, content);
}
