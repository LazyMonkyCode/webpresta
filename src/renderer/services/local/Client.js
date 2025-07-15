


class Client {
    constructor({ id = null, nickname = '',
        name = '',
        lastname = '',
        email = '',
        phone = '',
        gender = '',
        birthdate = '',
        document_number = '',
        address = '',
        city = '',
        state = '',
        zip = '',
        country = '',
        website = '',

        user_id = '',

    } = {}) {
        this.id = id
        this.nickname = nickname;
        this.name = name,
            this.lastname = lastname,
            this.email = email,
            this.phone = phone,
            this.gender = gender,
            this.birthdate = birthdate,
            this.document_number = document_number,
            this.address = address,
            this.city = city,
            this.state = state,
            this.zip = zip,
            this.country = country,
            this.website = website,
            this.user_id = user_id || 1,
            this.access_code;
    }



      async delete() {
    try {
      

      const result =await window.electron.database.delete("clients", {
        where: `id = ?`,
        
      },[this.id])


      console.log(result)

      /* const clientInformation =await window.electron.database.select("information", {
        where: `client_id = ?`,

      },[id],{one: true})
      console.log("information", clientInformation)

      console.log("client", client) */

      return true

    } catch (error) {
      console.log("Error al obtener el cliente por ID:", error);
      return null;
    }
  }

    async exists() {
        try {
            const result = await window.electron.database.select('clients', {
                where: `nickname = ?`, // Use a parameterized query to prevent SQL injection
                // Pass the email as a parameter
            },
                [this.nickname],
                { one: true }// Pass the email as a parameter
            );
            //console.log('cliente nickmae existence check result:', result);
            return result ? true : false // Returns true if email exists, false otherwise
        } catch (error) {
            //console.error('Error checking email existence:', error);
            return false; // Return false in case of error
        }


    }

    async getClient() {
        try {

            const query = this.username ? { username: this.username } : { email: this.email }

            const result = await window.electron.database.select('users', {
                where: `${query.username ? "username" : "email"} = ?`, // Use a parameterized query to prevent SQL injection
                // Pass the email as a parameter

            },
                [query.username ? query.username : query.email],
                { one: true }// Pass the email as a parameter
            );
            //console.log('Username existence check result:', result);
            this.id = result.id
            return result // Returns true if email exists, false otherwise
        } catch (error) {
            //console.error('Error checking email existence:', error);
            return false; // Return false in case of error
        }

    }


    async generateAccessCode() {
        const min = 10000;
        const max = 99999;
        const generados = new Set();

        if (generados.size >= (max - min + 1)) {
            throw new Error("Se han generado todos los números posibles de 5 dígitos.");
        }

        let numero;
        let isUnique = false
        do {

            const access_code = Math.floor(Math.random() * 90000) + 10000;

            //console.log("access_code", access_code)
            
            const result = await window.electron.database.select('clients', {
                where: `access_code = ?`,
            },
                [access_code],
                { one: true }// Pass the email as a parameter
            );

            //console.log('Access code existence check result:', result);

            if (!result) {

                numero = access_code
                isUnique = true
            }
        } while (!isUnique);


        return numero;

    };

    async insert() {

        try {
            // Check if username and email are provided
            // If not, log an error and return
         /*    if (!this.username || !this.email) {
                //console.error('Username and email are required to insert a user.');
                return;
            }
 */
            const access_code =await this.generateAccessCode()

            //TODO: save user in the database
            //console.log("access_code", access_code,this.nickname) 



         const result = await window.electron.database.insert('clients', ['nickname', 'access_code',"user_id"], [
                this.nickname, access_code,this.user_id])

                //console.log('Client inserted successfully:', result);
         this.id = result.lastInsertRowid  

         const clientInfo = this.getClientOb()
            delete clientInfo.id
            delete clientInfo.nickname
            delete clientInfo.created_at
            delete clientInfo.updated_at
            delete clientInfo.access_code
            
            delete clientInfo.user_id
            clientInfo.client_id = this.id // Add the client_id to the information object
            //TODO: save  the user information
           ////console.log( "information data", await window.electron.database.insert('information', Object.keys(clientInfo), Object.values(clientInfo)))


            ////console.log('Clientinserted successfully:', result);

           // this.id = result.lastInsertRowid;  // Assuming the database returns the last inserted ID */

        } catch (error) {
            //console.error('Error inserting client:', error);
            return;

        }


    }

    getClientOb() {

        return {
            id: this.id,
            nickname: this.nickname,
            name: this.name,
            lastname: this.lastname,
            email: this.email,
            phone: this.phone,
            gender: this.gender,
            birthdate: this.birthdate,
            document_number: this.document_number,
            address: this.address,
            city: this.city,
            state: this.state,
            zip: this.zip,
            country: this.country,
            website: this.website,

            user_id: this.user_id,
        }
    }

    async authToken() {
        try {

            const token = await window.electron.token.generate({
                id: this.id,
                username: this.username,
                email: this.email,
                role: this.role
            });

            return token; // Return the generated token
        } catch (error) {
            //console.error('Error generating auth token:', error);
        }

    }

    setUsername(username) {
        this.username = username;
    }

    setEmail(email) {
        this.email = email;
    }

    setPassword(password) {
        this.password = password;
    }

    setTerms(terms) {
        this.terms = terms;
    }

    getUserData() {
        return {
            username: this.username,
            email: this.email,
            password: this.password,
            terms: this.terms,
        };
    }
}


export default Client;