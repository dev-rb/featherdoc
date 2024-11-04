/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("gvgx0dsucbx91kt")

  // remove
  collection.schema.removeField("exmapzxf")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("gvgx0dsucbx91kt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "exmapzxf",
    "name": "comments",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "my2dqtddhzajocj",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
