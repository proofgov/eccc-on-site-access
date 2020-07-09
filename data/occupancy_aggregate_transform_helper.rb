# load csv province date
require 'csv'
buildings_to_occupancy = {}
CSV.foreach('data/buildings_to_occupancy.csv', headers: true, encoding: 'ISO-8859-1') do |row|
  buildings_to_occupancy[row[1]] = row[2].to_i
end

province_to_buildings_to_occupancy = {}
CSV.foreach('data/province_territory_to_buildings.csv', headers: true, encoding: 'ISO-8859-1') do |row|
  begin
    province_to_buildings_to_occupancy[row[0]][row[1]] = buildings_to_occupancy[row[1]]
  rescue NoMethodError => _e
    province_to_buildings_to_occupancy[row[0]] = {}
    province_to_buildings_to_occupancy[row[0]][row[1]] = buildings_to_occupancy[row[1]]
  end
end

# save back to yaml as one file
require 'yaml'
File.write('data/province_to_buildings_to_occupancy.yml', YAML.dump(province_to_buildings_to_occupancy))
