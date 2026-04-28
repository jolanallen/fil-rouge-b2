from flask import jsonify, request
from src.core.processing import ImmoGouvDataSource, SimpleLinearPredictor

def configure_routes(app, storage):
    
    @app.route('/api/v1/analyse', methods=['POST'])
    def launch_analysis():
        """
        Receives parameters (e.g., code_postal), fetches data, 
        calculates linear regression, and saves to Redis.
        The third-party service will then access Redis directly.
        """
        params = request.get_json()
        if not params:
            return jsonify({"error": "No parameters provided"}), 400
        
        # 1. Fetch data
        data_source = ImmoGouvDataSource()
        df = data_source.fetch_data(params)
        
        if df.is_empty():
            return jsonify({"error": "No data found for these parameters"}), 404
            
        # 2. Linear Calculation (Manual)
        predictor = SimpleLinearPredictor()
        predictor.train(df)
        results = predictor.get_params()
        
        # 3. Save to Redis
        # Third-party services will read from 'market:{code_postal}'
        region_key = params.get("code_postal", "unknown")
        storage.save_stats(f"market:{region_key}", results)
        
        return jsonify({
            "status": "analysis_completed",
            "key": f"market:{region_key}",
            "results": results
        }), 201
