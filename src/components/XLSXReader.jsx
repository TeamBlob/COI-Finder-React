import React from 'react';
import * as XLSX from 'xlsx';
import FileInput from './FileInput';
import { checkFields } from '../scripts/valid_fields'
import { buildPastSub, buildInst, buildMetaPC } from '../scripts/violation_structure';
import { buildProfiles } from "../scripts/profile";
import { concatList } from "../scripts/common_script"

const XLSXReader = ({setDashboard, setProfiles}) => {
    const coiTypeRegex = "(Inst|Meta|PastSub|PC|MetaPastSub)"
    const coiFileNameRegexStr = `(All-Coi|Coi)${coiTypeRegex}`
    const vaildFileRegexStr = "[A-Za-z0-9 -_.,()\[\]]*"
    const filenameRegex = new RegExp(`^(${coiFileNameRegexStr}${vaildFileRegexStr})`, 'i') // Regex for accepting files into the program
    const COI_DASHBOARD = {
        'positive': {},
        'possible': {},
    }
    
    const coiTypesDict = {
        "inst": {
            key: crypto.randomUUID(),
            href: "InstituionalCOI",
            name: "Instituional COI Violation",
            description: "It contains (potential) COI violation due to institutional match.",
            coi_function: buildInst
        },
        "meta_pc" : {
            key: crypto.randomUUID(),
            href: "PossibleCOI",
            name: "Possible COI Violation", 
            description: "It contains possible COI violations (based on the conference-specified policy for COI) with the assigned reviewers",
            coi_function: buildMetaPC
        },
        "pastsub": {
            key: crypto.randomUUID(),
            name: "Past Sub", 
            href: "PastSubCOI",
            description: "COI violations due to published papers that appear in DBLP",
            coi_function: buildPastSub
        }
    }
    

    const handleFileUpload = (files) => {
        const filesArray = Array.from(files); // Convert FileList to array
        Promise.all(
            filesArray.map((file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                        resolve({filename: file.name, data: jsonData});
                    };
                    reader.readAsArrayBuffer(file);
                });
            })
        ).then((results) => {
            processData(results)
        });
    };

    const processData = (data) => {
        if (data.length === 0) return
        
        data.forEach(sub_coi => {
            const filename = sub_coi.filename;
            if (!filenameRegex.test(filename)) return;
            const metadata = sub_coi.data;
            const fields = metadata[0];
            if (fields) {
                let type = checkFields(Object.keys(fields))
                if (type !== -1)
                    constructSubCOIJson(type, metadata)
            }
        });
        const profile = buildProfiles(COI_DASHBOARD);
        setProfiles(profile);
        setDashboard(COI_DASHBOARD);
    }
    const constructSubCOIJson = (type, metadata) =>{
        // retrieve coiType json from coiTypesDict dictionary
        const coiType = coiTypesDict[type.toLowerCase()]

        const coi_data = coiType.coi_function(metadata)
        const positive = coi_data[0];
        const possible = coi_data[1];
        // Populating Positive COI Dataset
        if (coiType.key in COI_DASHBOARD.positive)
        {
            const orginal = COI_DASHBOARD.positive[coiType.key].coi_data

            COI_DASHBOARD.positive[coiType.key].coi_data = concatList(orginal, positive.coi_data)
        }
        else {
            const positiveJson = {
                key: coiType.key,
                name: coiType.name,
                type: type.toLowerCase(),
                description: coiType.description,
                href: coiType.href,
                coi_data: positive.coi_data
            }
            COI_DASHBOARD.positive[coiType.key] = positiveJson
        }
        
        // Populating Possible COI Dataset
        if (coiType.key in COI_DASHBOARD.possible)
        {
            const orginal = COI_DASHBOARD.possible[coiType.key].coi_data

            COI_DASHBOARD.possible[coiType.key].coi_data = concatList(orginal, possible.coi_data)
        }
        else {
            const possibleJson = {
                key: coiType.key,
                name: coiType.name,
                type: type.toLowerCase(),
                description: coiType.description,
                href: coiType.href,
                coi_data: possible.coi_data
            }
            COI_DASHBOARD.possible[coiType.key] = possibleJson
        }
    }


    return (
        <div>
        <h2>Upload XLSX Files</h2>
            <FileInput onChange={handleFileUpload} />
        </div>
    );
};

export default XLSXReader;
