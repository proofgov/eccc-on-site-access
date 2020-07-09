# load csv province date
require 'csv'

acronyms_to_provinces = {}
CSV.foreach(
  'data/provinces_to_acronyms.csv',
  headers: true, encoding: 'ISO-8859-1'
) { |row| acronyms_to_provinces[row[1]] = row[0] }

province_to_buildings_to_occupancy = {}
CSV.foreach(
  'data/buildings_to_occupancy.csv',
  headers: true, encoding: 'ISO-8859-1'
) do |row|
  province_name = acronyms_to_provinces[row[0]]
  raise StandardError, 'Province not found.' if province_name.nil?

  building_name = row[1]
  occupancy = row[2].to_i
  begin
    province_to_buildings_to_occupancy[province_name][building_name] = occupancy
  rescue NoMethodError => _e
    province_to_buildings_to_occupancy[province_name] = {}
    province_to_buildings_to_occupancy[province_name][building_name] = occupancy
  end
end

CSV.foreach(
  'data/province_territory_to_buildings.csv',
  headers: true, encoding: 'ISO-8859-1'
) do |row|
  province_name = row[0]
  building_name = row[1]
  begin
    if province_to_buildings_to_occupancy[province_name].nil?
      raise StandardError, 'Province not found.'
    end
    if province_to_buildings_to_occupancy[province_name][building_name].nil?
      raise StandardError, 'Building not found.'
    end
  rescue StandardError => _e
    puts 'Failed to find data for:'
    puts "province_name: #{province_name}"
    puts "building_name: #{building_name}"
  end
end

# save back to yaml as one file
require 'yaml'
File.write(
  'data/province_to_buildings_to_occupancy.yml',
  YAML.dump(
    province_to_buildings_to_occupancy.each_key do |k|
      province_to_buildings_to_occupancy[k] =
        province_to_buildings_to_occupancy[k].sort.to_h
    end.sort.to_h
  )
)
