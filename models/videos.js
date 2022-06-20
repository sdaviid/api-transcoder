class Videos{
	constructor(dao){
		this.dao = dao;
	}

	createTable(){
		const sql = `
		CREATE TABLE IF NOT EXISTS videos(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		origin VARCHAR(255) NOT NULL,
		status INTEGER NOT NULL
		)
		`;
		return this.dao.run(sql);
	}

	create(origin){
		return this.dao.run(`
			INSERT INTO videos(origin, status) values (?, 0)
		`, [origin]);
	}

	getById(id){
		return this.dao.get(`
			SELECT * FROM videos WHERE ID = ?
		`, [id]);
	}

	getAll(){
		return this.dao.all(`
			SELECT * FROM videos
		`);
	}

	update_status(id, status){
		return this.dao.run(`
			UPDATE videos SET status = ? WHERE ID = ?
		`, [status, id]);
	}

	findByStatus(status){
		return this.dao.all(`
			SELECT * FROM videos WHERE status = ?
		`, [status]);
	}
}

module.exports = Videos;