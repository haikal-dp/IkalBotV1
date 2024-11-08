const axios = require('axios')
const nomor = '6285173229118'

async function spamPesan() {
  const pesan = 'Pesan spam percobaan'
  
  for (let i = 1; i <= 10; i++) {
    try {
      const response = await axios.post('http://localhost/kirimpesan', {
        nomor: nomor,
        pesan: pesan
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`Spam ke-${i} berhasil: `, response.data)
    } catch (error) {
      console.error(`Spam ke-${i} gagal: `, error.message)
    }
  }
}

spamPesan()