const Airtable = require('airtable');
const axios = require('axios');
const md5 = require('md5');
const myAirtable = new Airtable({ apiKey: 'keyiY6gfgFhhOT0pZ' });

const APP_KEY = 'WwUiPqVWqXbzHdPHHu0wvkD1tAQd7BmK';
const APP_ID = '0aac5794d14bdeae';

const baseList = {
    'Study Guides': 'appTEVRZYRknxEP2u',
    'GRE3000': 'appxCypfZhS3KZdQE'
};

const sheetList = [
  'GRE3000',
  'TOEFL Collected',
  'GRE Collected',
  '3K Unfamiliar'
];

const fillUpMeanings = (base, sheet) => {
    base(sheet).select({
        view: "Grid view"
    }).eachPage((records, fetchNextPage) => {
        records.forEach(record => {
            const id = record.getId();
            if (!record.get('Meanings')) {
                const word = record.get('Word');
                const salt = Date.now();
                const sign = md5(APP_ID + word + salt + APP_KEY);
                axios.get(`https://openapi.youdao.com/api?appKey=${APP_ID}&q=${word}&from=EN&to=zh-CH&sign=${sign}&salt=${salt}`)
                    .then(res => {
                        let meaning = res.data.basic || res.data.translation;
                        if (meaning.explains) meaning = meaning.explains;
                        return meaning.toString();
                    })
                    .then(meaning => {
                        base(sheet).update(id, {
                            "Meanings": meaning
                        }, (err, record) => {
                            if (err) return console.error(err);
                            console.log(record.get('Word'), meaning);
                        });
                    })
                    .catch(err => console.log(err))
            }
        });
        fetchNextPage();
    }, err => {
        if (err) { console.error(err); return; }
    });
}

// fillUpMeanings(myAirtable.base(baseList['Study Guides']), sheetList[2]);
fillUpMeanings(myAirtable.base(baseList['GRE3000']), sheetList[3 ]);