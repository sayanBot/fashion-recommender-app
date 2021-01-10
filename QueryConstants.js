const createParty = `INSERT INTO party_details(party_name,party_address,party_sex,party_age,party_mail,party_phone,party_password,password_salt) `
const searchPartyByEmail = `SELECT party_password,password_salt FROM party_details PT WHERE PT.party_mail=`

module.exports ={
    createParty,
    searchPartyByEmail
}