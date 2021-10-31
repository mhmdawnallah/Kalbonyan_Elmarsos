const fs = require('fs');
const crypto = require('crypto');
class UsersRepository {
	constructor(filename) {
		if (!filename) {
			throw new Error('Creating a Repository requires a filename');
		}
		this.filename = filename;
		try {
			fs.accessSync(this.filename);
		} catch (err) {
			// We will always deal with an array data structure
			fs.writeFileSync(this.filename, '[]');
		}
	}

	async getAll() {
		return JSON.parse(
			await fs.promises.readFile(this.filename, {
				encoding: 'utf8'
			})
		);
	}

	async create(attrs) {
		// {email:'askdsadasdsadasd', password:'sdaddsadas'}
		attrs.id = this.randomId();

		const records = await this.getAll();
		records.push(attrs);

		await this.writeAll(records);
	}

	async writeAll(records) {
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}
	randomId() {
		return crypto.randomBytes(4).toString('hex');
	}

	async getOne(id) {
		const records = await this.getAll();
		return records.find((record) => record.id === id);
	}

	async delete(id) {
		const records = await this.getAll();
		const filteredRecords = records.filter((record) => record.id !== id);
		await this.writeAll(filteredRecords);
	}

	async update(id, attrs) {
		const records = await this.getAll();
		const record = records.find((record) => record.id === id);
		if (!record) {
			throw new Error(`Record with ${id} not found`);
		}
		// record === {email : "test@test.com"}
		// attrs === { password: 'mypassword}
		Object.assign(record, attrs);
		// record === {email: "test@test.com", password:"mypassword"}
		await this.writeAll(records);
	}

	async getOneBy(filters) {
		const records = await this.getAll();

		for (let record of records) {
			let found = true;

			for (let key in filters) {
				if (record[key] !== filters[key]) {
					found = false;
				}
			}
			if (found) {
				return record;
			}
		}
	}
}

const test = async () => {
	const repo = new UsersRepository('users.json');
	await repo.create({ email: 'test@test.com' });
	await repo.update('a0c92fde', { password: 'myPassword' });
	const user = await repo.getOneBy({ password: 'myPsassword' });
	console.log(user)
};

test();
