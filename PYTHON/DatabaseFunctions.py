import sqlite3
import csv

class DatabaseFunctions:

	DATABASE_NAME = ""
	DATABASE_TABLE_NAME = ""
	OUTPUT_PATH = "../Output/"

	def connect_database(self):
		return sqlite3.connect(self.DATABASE_NAME)

	def load_data(self):
		dataArray = []
		dataBase = self.connect_database()

		for row in dataBase.execute(f'SELECT * FROM {self.DATABASE_TABLE_NAME}').fetchall():
			dataArray.append(row)
		dataBase.close()
		return dataArray

	def __db_to_csv(self):
		lineBreak = "\n"
		db = self.connect_database() # Creates a connection to the database
		cursor = db.execute(f"SELECT * FROM {self.DATABASE_TABLE_NAME}") # Selects everything from the chosen table
		columnNames = list(map(lambda x: x[0], cursor.description)) # Gets all the column names in the chosen table
		# Opens a new file which is gonna be the converted csv file
		with open(self.OUTPUT_PATH + self.DATABASE_TABLE_NAME + "_converted.csv", "w+") as file:
			# Loops through the columns and writes them into the file. 
			for column in columnNames:
				file.write(str(column) + ",")
			file.write(lineBreak)    
			# Loops through the list of data provided by "load_data()" and then writes
			# all the data into the file with appropriate spaces and comma seperation
			# to be compatible with the CSV format
			for data in dbF.load_data():
				for i in range(0, len(data)):
					file.write(str(data[i]) + ",")
				file.write(lineBreak)
			file.close()

	def save_data_in_folder(self, fileExtension: str):
		if fileExtension.endswith(".csv"):
			print("Converting from db to csv...")
			self.__db_to_csv()
			print("Succesfully converted")
		else:
			raise Exception("ERROR: Can only convert the database to csv currently.")

	def insert_into_database(self, databaseName, data):
		try:
			connection = sqlite3.connect(databaseName)
			cursor = connection.cursor()
			sql = "INSERT INTO interactionLogs (connectionID, interactionType, interactionOutput, timestamp) VALUES (?, ?, ?, ?)"
			cursor.execute(sql, data)
			connection.commit()
			connection.close()
		except sqlite3.Error as e:
			print(f"Database error: {e}")

#dbF = DatabaseFunctions(databaseName="interactionsDatabase.db", databaseTable="interactionLogs")
#dbF.save_data_in_folder(".csv")