class VideosDetail{
	constructor(dao){
		this.dao = dao;
	}

	createTable(){
		const sql = `
		CREATE TABLE IF NOT EXISTS videos_detail(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_video INTEGER NOT NULL,
		percentage VARCHAR(255),
		status INTEGER NOT NULL
		)
		`;
		return this.dao.run(sql);
	}


	create(id_video, status, percentage){
		return this.dao.run(`
			INSERT INTO videos_detail(id_video, status, percentage) values (?, ?, 0)
		`, [id_video, status]);
	}

	update_percentage(id, percentage){
		return this.dao.run(`
			UPDATE videos_detail SET percentage = ? WHERE id = ?
		`, [percentage, id]);
	}


	getById(id){
		return this.dao.get(`
			SELECT * FROM videos_detail WHERE ID = ?
		`, [id]);
	}

	getByIdVideo(id_video){
		return this.dao.get(`
			SELECT * FROM videos_detail WHERE id_video = ?
		`, [id_video]);
	}
}


module.exports = VideosDetail;