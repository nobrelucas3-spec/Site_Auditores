import https from 'https';
import fs from 'fs';
import path from 'path';

const images = [
    {
        "id": "DVn_xmEjSvK",
        "src": "https://instagram.frec2-1.fna.fbcdn.net/v/t51.82787-15/649630736_18075338300427187_5464803947676784706_n.heic?stp=dst-jpg_e35_s1080x1080_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE0NDAuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.frec2-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QHOxxIC3-QLMmrMRXhAytvOabjxzxycNPUg9uNaImSgXkJGZ1SmV6bHk-YwLcdckM69Ue-PB2m9obJqMROYo4hn&_nc_ohc=HhiA1RxMpaEQ7kNvwG9acut&_nc_gid=iFh3CNUuhNZ3Kw0bnLZk3Q&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzAuXlF0n1DoyuCMqhC7dRrLGvob1vLn-lDAYA_WSAnhg&oe=69B68B78&_nc_sid=10d13b"
    },
    {
        "id": "DVcN6wmj2Ev",
        "src": "https://instagram.frec2-1.fna.fbcdn.net/v/t51.82787-15/640994310_18074799590427187_6400770051263428718_n.heic?stp=dst-jpg_e35_p1080x1080_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.frec2-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QF25JFs1h7HOeZA_begE4EzVxQlv5H2t2dTAvWq4CDSVbFJKxXV6568cP6BqERwiZ3GXcB5J06ix7qa2FbJLW3r&_nc_ohc=It1ofI4HN_8Q7kNvwHlkDNS&_nc_gid=JWXLvGLH53wqUKVkORjCPw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afw2X0xIWq1cUbFW4GUiwurm2uBsYmqKL0g36ITrbCH0xQ&oe=69B67A5E&_nc_sid=10d13b"
    },
    {
        "id": "DVJI4kgDTAk",
        "src": "https://instagram.frec2-1.fna.fbcdn.net/v/t51.82787-15/641161675_18074101568427187_5904528281471498981_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDEwODAuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.frec2-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QEk6dHfe-Sck2LDkMimDeWnlVJAX1mbGd62VXOEgjId3GSeJ1vJGwMmdiBrgQ0x6TG8FcPwKEh5FihsMae-vZUH&_nc_ohc=9yAj_CxVbXUQ7kNvwHANy_C&_nc_gid=d65T3yVl42BkN6Ltbj2Img&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwJePE_d8rJ_P-mDhMIpBAr5eoS6XtmWMIjD4wWLKsGSw&oe=69B6A236&_nc_sid=10d13b"
    },
    {
        "id": "DU-u5U3Ec9i",
        "src": "https://instagram.frec2-1.fna.fbcdn.net/v/t51.82787-15/639715593_18113031781648854_1784673585111461366_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMzUweDE2ODguc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.frec2-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QEz1tR6__4G55c4N2oTTVs3B9ZEB7qIPZ1cQwTvE2v6a7xnvFa5UXzDDS-4gKsu8BFEN4Uiyu_OfClGb6QR9Oxd&_nc_ohc=CAVjSVaivaoQ7kNvwEgp-Xg&_nc_gid=rPlsVFURyUxuhBaO8lyxOQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfxOiDULtyL5Si75jfhDTFm7fq--aP3fFIIqYPjhxYXKcQ&oe=69B66FE0&_nc_sid=10d13b"
    }
];

async function downloadImage(img) {
    return new Promise((resolve, reject) => {
        https.get(img.src, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${img.id}: ${res.statusCode}`));
                return;
            }
            const filePath = path.join(process.cwd(), 'public', 'social', `${img.id}.png`);
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                console.log(`Downloaded image for ${img.id}`);
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    for (const img of images) {
        try {
            await downloadImage(img);
        } catch (e) {
            console.error(e);
        }
    }
}

main();
